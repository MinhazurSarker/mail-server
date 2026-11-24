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

  // Wire MailEvents directly to WebSocket broadcast with session freshness validation
  MailEvents.onMailReceived(async (event) => {
    const sockets = userSockets.get(event.userId);
    if (sockets && sockets.size > 0) {
      const user = await UserModel.findById(event.userId);
      if (!user || user.status !== "ACTIVE") {
        for (const ws of sockets) {
          ws.close(4003, "Account inactive or suspended");
        }
        userSockets.delete(event.userId);
        return;
      }

      const payload = JSON.stringify({
        type: "mail:received",
        data: event,
      });
      for (const ws of Array.from(sockets)) {
        if ((ws as any).tokenVersion !== user.tokenVersion) {
          ws.close(4001, "Session revoked");
          sockets.delete(ws);
          continue;
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  });

  MailEvents.onStateChanged(async (event) => {
    const sockets = userSockets.get(event.userId);
    if (sockets && sockets.size > 0) {
      const user = await UserModel.findById(event.userId);
      if (!user || user.status !== "ACTIVE") {
        for (const ws of sockets) {
          ws.close(4003, "Account inactive or suspended");
        }
        userSockets.delete(event.userId);
        return;
      }

      const payload = JSON.stringify({
        type: "mail:state_changed",
        data: event,
      });
      for (const ws of Array.from(sockets)) {
        if ((ws as any).tokenVersion !== user.tokenVersion) {
          ws.close(4001, "Session revoked");
          sockets.delete(ws);
          continue;
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  });

  // Attach WebSocket server for real-time mailbox events
  const wss = new WebSocketServer({ server, path: "/ws" });

  async function validateToken(token: string): Promise<{ userId: string; tokenVersion: number } | null> {
    try {
      const payload = await AuthService.verifyAccessToken(token);
      const user = await UserModel.findById(payload.userId);
      if (!user || user.status !== "ACTIVE") {
        return null;
      }
      if (user.tokenVersion !== (payload.tokenVersion || 1)) {
        return null;
      }
      if (user.role !== "PLATFORM_ADMIN" && user.organizationId) {
        const org = await OrganizationModel.findById(user.organizationId);
        if (org && org.status === "SUSPENDED") {
          return null;
        }
      }
      return { userId: user._id.toString(), tokenVersion: user.tokenVersion };
    } catch {
      return null;
    }
  }

  wss.on("connection", async (ws, req) => {
    let currentUserId: string | null = null;

    const registerSocket = (userId: string, tokenVersion: number) => {
      currentUserId = userId;
      (ws as any).userId = userId;
      (ws as any).tokenVersion = tokenVersion;
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(ws);
      ws.send(
        JSON.stringify({
          type: "authenticated",
          userId,
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
            registerSocket(valid.userId, valid.tokenVersion);
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
            registerSocket(valid.userId, valid.tokenVersion);
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
