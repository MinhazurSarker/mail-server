import { readFileSync, existsSync, watch } from "node:fs";
import { connectToDatabase } from "@cellsinbox/db";
import { env } from "@cellsinbox/env";
import { seedPrimaryTenantIfMissing } from "@cellsinbox/service";
import { createSmtpServer } from "./server.js";

const PORT = env.SMTP_PORT || 2525;
const HOST = env.SMTP_HOST || "0.0.0.0";

async function bootstrap() {
  await connectToDatabase();
  console.log("[SMTP Server] Connected to MongoDB.");

  try {
    await seedPrimaryTenantIfMissing();
    console.log("[SMTP Server] Primary tenant and verified domain verified in database.");
  } catch (seedErr) {
    console.error("[SMTP Server] Seeding error:", seedErr);
  }

  let key: Buffer | undefined;
  let cert: Buffer | undefined;

  if (env.SMTP_TLS_KEY_PATH && existsSync(env.SMTP_TLS_KEY_PATH)) {
    key = readFileSync(env.SMTP_TLS_KEY_PATH);
    console.log(`[SMTP Server] Loaded TLS Private Key from ${env.SMTP_TLS_KEY_PATH}`);
  }
  if (env.SMTP_TLS_CERT_PATH && existsSync(env.SMTP_TLS_CERT_PATH)) {
    cert = readFileSync(env.SMTP_TLS_CERT_PATH);
    console.log(`[SMTP Server] Loaded TLS Certificate from ${env.SMTP_TLS_CERT_PATH}`);
  }

  const server = createSmtpServer({ port: PORT, host: HOST, key, cert });

  // Automatic Hot-Reload when Traefik cert-dumper updates certificates on disk
  if (env.SMTP_TLS_CERT_PATH && existsSync(env.SMTP_TLS_CERT_PATH)) {
    try {
      watch(env.SMTP_TLS_CERT_PATH, () => {
        try {
          if (!env.SMTP_TLS_KEY_PATH || !env.SMTP_TLS_CERT_PATH) return;
          const freshKey = readFileSync(env.SMTP_TLS_KEY_PATH);
          const freshCert = readFileSync(env.SMTP_TLS_CERT_PATH);
          server.updateSecureContext({ key: freshKey, cert: freshCert });
          console.log("[SMTP Server] Hot-reloaded TLS certificates successfully from disk!");
        } catch (reloadErr) {
          console.error("[SMTP Server] Failed to hot-reload TLS certificates:", reloadErr);
        }
      });
      console.log(`[SMTP Server] Certificate watcher active on ${env.SMTP_TLS_CERT_PATH}`);
    } catch (watchErr) {
      console.warn("[SMTP Server] Could not initialize TLS certificate watcher:", watchErr);
    }
  }

  server.listen(PORT, HOST, () => {
    console.log(`[SMTP Server] Listening on ${HOST}:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[SMTP Server] Fatal startup error:", err);
  process.exit(1);
});
