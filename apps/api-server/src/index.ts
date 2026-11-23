import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CoreRPC } from "@cellsweb/rpc-core";
import { FormatRegistry } from "@sinclair/typebox";
import { WebSocketServer, WebSocket } from "ws";
import { connectToDatabase } from "@cellsinbox/db";
import { AuthService, MailEvents, ApiKeyService } from "@cellsinbox/service";
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

  // Wire MailEvents directly to WebSocket broadcast
  MailEvents.onMailReceived((event) => {
    const sockets = userSockets.get(event.userId);
    if (sockets && sockets.size > 0) {
      const payload = JSON.stringify({
        type: "mail:received",
        data: event,
      });
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  });

  MailEvents.onStateChanged((event) => {
    const sockets = userSockets.get(event.userId);
    if (sockets && sockets.size > 0) {
      const payload = JSON.stringify({
        type: "mail:state_changed",
        data: event,
      });
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  });

  // Attach WebSocket server for real-time mailbox events
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    let currentUserId: string | null = null;

    const registerSocket = (userId: string) => {
      currentUserId = userId;
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
          const payload = await AuthService.verifyAccessToken(token);
          registerSocket(payload.userId);
        }
      }
    } catch {
      // Token in URL invalid, wait for message auth
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth" && typeof message.token === "string") {
          const payload = await AuthService.verifyAccessToken(message.token);
          registerSocket(payload.userId);
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
