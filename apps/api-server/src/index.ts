import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CoreRPC } from "@cellsweb/rpc-core";
import { FormatRegistry } from "@sinclair/typebox";
import { WebSocketServer, WebSocket } from "ws";
import { connectToDatabase, UserModel, OrganizationModel } from "@cellsinbox/db";
import { AuthService, MailEvents, ApiKeyService, seedPrimaryTenantIfMissing } from "@cellsinbox/service";
import { env } from "./env.js";

if (!FormatRegistry.Has("email")) {
  FormatRegistry.Set("email", (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  );
}
if (!FormatRegistry.Has("date-time")) {
  FormatRegistry.Set("date-time", (value) => !isNaN(Date.parse(value)));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await connectToDatabase();
  console.log("[API Server] Connected to MongoDB.");

  try {
    await seedPrimaryTenantIfMissing();
    console.log("[API Server] Primary tenant and verified domain verified in database.");
  } catch (seedErr) {
    console.error("[API Server] Seeding error:", seedErr);
  }

  const app = new CoreRPC({
    functionsDir: path.join(__dirname, "functions"),
    middlewaresDir: path.join(__dirname, "middlewares"),
    docsEndpoint: "/docs",
    rpcEndpoint: "/rpc",
    port: env.API_PORT,
    host: env.API_HOST,
    docs: env.API_DOCS_ENABLED,
  });

  const rpcHandler = await app.createHandler();

  const server = http.createServer(async (req, res) => {
    // Enable CORS for Next.js web client
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key",
    );

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    await rpcHandler(req, res);
  });

  // Track connected WebSockets by authenticated userId
  const userSockets = new Map<string, Set<WebSocket>>();

  // Wire MailEvents directly to WebSocket broadcast with session freshness validation (R6, R7)
  // Non-async wrapper prevents unhandled promise rejections on EventEmitter (R7)
  MailEvents.onMailReceived((event) => {
    (async () => {
      try {
        const sockets = userSockets.get(event.userId);
        if (!sockets || sockets.size === 0) return;

        const user = await UserModel.findById(event.userId);
        if (!user || user.status !== "ACTIVE") {
          for (const ws of Array.from(sockets)) {
            try { ws.close(4003, "Account inactive or suspended"); } catch {}
          }
          userSockets.delete(event.userId);
          return;
        }

        // Strict organization status verification before delivering event (R6, R9)
        if (user.role !== "PLATFORM_ADMIN") {
          try {
            await AuthService.assertActiveTenant(user);
          } catch {
            for (const ws of Array.from(sockets)) {
              try { ws.close(4003, "Organization suspended or inactive"); } catch {}
            }
            userSockets.delete(event.userId);
            return;
          }
        }

        const payload = JSON.stringify({
          type: "mail:received",
          data: event,
        });

        const now = Date.now();
        const userVersion = user.tokenVersion || 1;

        for (const ws of Array.from(sockets)) {
          try {
            // Expiry check (R6)
            if ((ws as any).expiresAt && now >= (ws as any).expiresAt) {
              ws.close(4001, "Session expired");
              sockets.delete(ws);
              continue;
            }
            // Version check (R6)
            if ((ws as any).tokenVersion !== userVersion) {
              ws.close(4001, "Session revoked");
              sockets.delete(ws);
              continue;
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(payload);
            }
          } catch (sendErr) {
            console.error("[WebSocket Dispatch] Send error:", sendErr);
          }
        }
      } catch (broadcastErr) {
        console.error("[MailEvents WebSocket] Broadcast error:", broadcastErr);
      }
    })();
  });

  MailEvents.onStateChanged((event) => {
    (async () => {
      try {
        const sockets = userSockets.get(event.userId);
        if (!sockets || sockets.size === 0) return;

        const user = await UserModel.findById(event.userId);
        if (!user || user.status !== "ACTIVE") {
          for (const ws of Array.from(sockets)) {
            try { ws.close(4003, "Account inactive or suspended"); } catch {}
          }
          userSockets.delete(event.userId);
          return;
        }

        if (user.role !== "PLATFORM_ADMIN") {
          try {
            await AuthService.assertActiveTenant(user);
          } catch {
            for (const ws of Array.from(sockets)) {
              try { ws.close(4003, "Organization suspended or inactive"); } catch {}
            }
            userSockets.delete(event.userId);
            return;
          }
        }

        const payload = JSON.stringify({
          type: "mail:state_changed",
          data: event,
        });

        const now = Date.now();
        const userVersion = user.tokenVersion || 1;

        for (const ws of Array.from(sockets)) {
          try {
            if ((ws as any).expiresAt && now >= (ws as any).expiresAt) {
              ws.close(4001, "Session expired");
              sockets.delete(ws);
              continue;
            }
            if ((ws as any).tokenVersion !== userVersion) {
              ws.close(4001, "Session revoked");
              sockets.delete(ws);
              continue;
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(payload);
            }
          } catch (sendErr) {
            console.error("[WebSocket Dispatch] Send error:", sendErr);
          }
        }
      } catch (broadcastErr) {
        console.error("[MailEvents WebSocket] Broadcast error:", broadcastErr);
      }
    })();
  });

  // Attach WebSocket server for real-time mailbox events
  const wss = new WebSocketServer({ server, path: "/ws" });

  async function validateToken(token: string): Promise<{
    userId: string;
    tokenVersion: number;
    expiresAt: number;
  } | null> {
    try {
      const payload = await AuthService.verifyAccessToken(token);
      const user = await UserModel.findById(payload.userId);
      if (!user || user.status !== "ACTIVE") {
        return null;
      }
      const userVersion = user.tokenVersion || 1;
      const payloadVersion = payload.tokenVersion || 1;
      if (userVersion !== payloadVersion) {
        return null;
      }
      // Strict tenant validation (R9)
      try {
        await AuthService.assertActiveTenant(user);
      } catch {
        return null;
      }

      const exp = (payload as any).exp
        ? (payload as any).exp * 1000
        : Date.now() + 24 * 3600 * 1000;

      return {
        userId: user._id.toString(),
        tokenVersion: userVersion,
        expiresAt: exp,
      };
    } catch {
      return null;
    }
  }

  wss.on("connection", async (ws, req) => {
    let currentUserId: string | null = null;

    const registerSocket = (info: { userId: string; tokenVersion: number; expiresAt: number; token: string }) => {
      if (ws.readyState !== 1) return; // Closed during async authentication

      // If socket was previously registered under a different user, clean up old mapping first
      if (currentUserId && currentUserId !== info.userId && userSockets.has(currentUserId)) {
        const oldSet = userSockets.get(currentUserId)!;
        oldSet.delete(ws);
        if (oldSet.size === 0) userSockets.delete(currentUserId);
      }

      currentUserId = info.userId;
      (ws as any).userId = info.userId;
      (ws as any).tokenVersion = info.tokenVersion;
      (ws as any).expiresAt = info.expiresAt;
      (ws as any).authToken = info.token;

      if (!userSockets.has(info.userId)) {
        userSockets.set(info.userId, new Set());
      }
      userSockets.get(info.userId)!.add(ws);
      ws.send(
        JSON.stringify({
          type: "authenticated",
          userId: info.userId,
          timestamp: new Date().toISOString(),
        }),
      );
    };

    // 1. Try URL query param authentication (?token=...)
    try {
      if (req.url) {
        const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const token = urlObj.searchParams.get("token");
        if (token) {
          const valid = await validateToken(token);
          if (valid) {
            registerSocket({ ...valid, token });
          } else {
            ws.close(4001, "Invalid, expired, or revoked session token");
            return;
          }
        }
      }
    } catch {
      // Token in URL invalid, wait for message auth
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth" && typeof message.token === "string") {
          const valid = await validateToken(message.token);
          if (valid) {
            registerSocket({ ...valid, token: message.token });
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Authentication failed: session invalid, expired, or revoked",
              }),
            );
            ws.close(4001, "Authentication failed");
          }
        } else if (message.type === "ping") {
          // Re-verify expiry and session freshness during ping (R6)
          if ((ws as any).expiresAt && Date.now() >= (ws as any).expiresAt) {
            ws.close(4001, "Session expired");
            return;
          }
          if ((ws as any).authToken) {
            const stillValid = await validateToken((ws as any).authToken);
            if (!stillValid) {
              ws.close(4001, "Session revoked or suspended");
              return;
            }
          }
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (err: any) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: err?.message || "Invalid message format",
          }),
        );
      }
    });

    ws.on("close", () => {
      if (currentUserId && userSockets.has(currentUserId)) {
        const set = userSockets.get(currentUserId)!;
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(currentUserId);
        }
      }
    });

    ws.on("error", () => {
      if (currentUserId && userSockets.has(currentUserId)) {
        const set = userSockets.get(currentUserId)!;
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(currentUserId);
        }
      }
    });

    ws.send(
      JSON.stringify({
        type: "connected",
        authenticated: !!currentUserId,
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // Periodic idle socket revalidation sweep (R6)
  const sweepInterval = setInterval(async () => {
    for (const [userId, sockets] of userSockets.entries()) {
      for (const ws of sockets) {
        if (ws.readyState !== 1) {
          sockets.delete(ws);
          continue;
        }
        const token = (ws as any).authToken;
        if (token) {
          const valid = await validateToken(token);
          if (!valid) {
            try {
              ws.close(4001, "Session expired, revoked, or suspended");
            } catch {
              // ignore
            }
            sockets.delete(ws);
          }
        }
      }
      if (sockets.size === 0) {
        userSockets.delete(userId);
      }
    }
  }, 30000);
  sweepInterval.unref();

  server.listen(env.API_PORT, env.API_HOST, () => {
    console.log(
      `[API Server] CellsWeb RPC listening on http://${env.API_HOST}:${env.API_PORT}`,
    );
  });
}

main().catch((err) => {
  console.error("[API Server] Fatal startup error:", err);
  process.exit(1);
});
