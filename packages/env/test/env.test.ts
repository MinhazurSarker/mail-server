import test from "node:test";
import assert from "node:assert/strict";
import { env, envSchema, booleanEnv, _resetEnvCache } from "../dist/index.js";

test("booleanEnv correctly parses boolean strings and values", () => {
  const schemaDefaultTrue = booleanEnv(true);
  const schemaDefaultFalse = booleanEnv(false);

  // False variants
  assert.equal(schemaDefaultTrue.parse("false"), false);
  assert.equal(schemaDefaultTrue.parse("0"), false);
  assert.equal(schemaDefaultTrue.parse("no"), false);
  assert.equal(schemaDefaultTrue.parse(false), false);

  // True variants
  assert.equal(schemaDefaultFalse.parse("true"), true);
  assert.equal(schemaDefaultFalse.parse("1"), true);
  assert.equal(schemaDefaultFalse.parse("yes"), true);
  assert.equal(schemaDefaultFalse.parse(true), true);

  // Default fallbacks
  assert.equal(schemaDefaultTrue.parse(undefined), true);
  assert.equal(schemaDefaultFalse.parse(undefined), false);
});

test("envSchema parses boolean flags without Zod coercion flaws", () => {
  const parsed = envSchema.parse({
    API_DOCS_ENABLED: "false",
    SMTP_SECURE: "true",
    SMTP_PORT: "587",
  });

  assert.equal(parsed.API_DOCS_ENABLED, false, "API_DOCS_ENABLED='false' must parse to boolean false");
  assert.equal(parsed.SMTP_SECURE, true, "SMTP_SECURE='true' must parse to boolean true");
  assert.equal(parsed.SMTP_PORT, 587, "SMTP_PORT='587' must coerce to number 587");
});

test("env Proxy returns runtime values in production without .env file (F15 fix)", () => {
  const originalEnv = { ...process.env };

  try {
    _resetEnvCache();
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PHASE;
    process.env.MONGODB_URI = "mongodb://custom-prod-host:27017/prod_db";
    process.env.API_DOCS_ENABLED = "false";

    // F15 bug check: previously in NODE_ENV=production without .env file,
    // env.MONGODB_URI returned undefined! Now it MUST return the real string.
    assert.equal(env.MONGODB_URI, "mongodb://custom-prod-host:27017/prod_db");
    assert.equal(env.API_DOCS_ENABLED, false);
  } finally {
    process.env = originalEnv;
    _resetEnvCache();
  }
});

test("env Proxy returns undefined during NEXT_PHASE=phase-production-build", () => {
  const originalEnv = { ...process.env };

  try {
    _resetEnvCache();
    process.env.NEXT_PHASE = "phase-production-build";
    process.env.MONGODB_URI = "mongodb://should-be-ignored:27017/db";

    assert.equal(env.MONGODB_URI, undefined);
  } finally {
    process.env = originalEnv;
    _resetEnvCache();
  }
});
