import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { cwd } from "node:process";
import { z } from "zod";

// Find .env by walking up directory tree from cwd
function findEnvFile(): string | undefined {
  let dir = cwd();
  const root = resolve("/");

  while (dir !== root) {
    const envPath = join(dir, ".env");
    if (existsSync(envPath)) {
      return envPath;
    }
    dir = dirname(dir);
  }
  return undefined;
}

const envPath = findEnvFile();
if (envPath) {
  config({ path: envPath });
}

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/cellsinbox"),
  MONGODB_USER: z.string().optional(),
  MONGODB_PASS: z.string().optional(),
  MONGODB_DB_NAME: z.string().default("cellsinbox"),

  JWT_SECRET: z
    .string()
    .min(32)
    .default("default_secret_at_least_32_characters_long_for_dev_only"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default("default_refresh_secret_at_least_32_characters_dev_only"),
  JWT_EXPIRES_IN: z.coerce
    .number()
    .default(60 * 60 * 24 * 30)
    .optional(),
  JWT_REFRESH_EXPIRES_IN: z.coerce
    .number()
    .default(60 * 60 * 24 * 30 * 3)
    .optional(),

  // SMTP configuration for email service
  SMTP_HOST: z.string().default("0.0.0.0").optional(),
  SMTP_PORT: z.coerce.number().default(2525).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false).optional(),
  SMTP_TLS_KEY_PATH: z.string().optional(),
  SMTP_TLS_CERT_PATH: z.string().optional(),
  MAIL_HELO_HOST: z.string().default("mail.cells.local").optional(),

  PUBLIC_DIR: z.string().default("./public").optional(),

  // Frontend URL for email links
  FRONTEND_URL: z.string().url().default("http://localhost:3000").optional(),

  // Bootstrap Admin Credentials (injected by installer)
  BOOTSTRAP_ADMIN: z.string().email().default("admin@cells.local").optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().default("AdminPassword123!").optional(),

  API_HOST: z.string().default("0.0.0.0").optional(),
  API_PORT: z.coerce.number().default(4000).optional(),
  API_DOCS_ENABLED: z.coerce.boolean().default(true).optional(),
  API_LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info")
    .optional(),

  QUEUE_POLL_INTERVAL_MS: z.coerce.number().default(5000).optional(),
});

export type Env = z.infer<typeof envSchema>;

// Lazy initialization - only validates at runtime, not during build
let _env: Env | null = null;

// Check if we're in Next.js build mode
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  (process.env.NODE_ENV === "production" && !envPath);

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    // Skip validation during build time - return undefined
    if (isBuildTime) {
      return undefined;
    }

    if (!_env) {
      _env = envSchema.parse(process.env);
    }
    return _env[prop as keyof Env];
  },
});
