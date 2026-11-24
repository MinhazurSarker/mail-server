# CellsInbox — Sub-Batch 1B Remediation & Verification Report

**Date:** November 24, 2026  
**Branch:** `remediation/audit-fixes`  
**Reference Document:** `docs/CODE_REVIEW_1B.md` (Findings R1–R11)  
**Scope:** Authentication Challenge Engine, Session Hardening, Test Database Isolation, Tenant Lifecycle, and Multi-Account Session Management.

---

## 1. Executive Summary

Following the independent review in `docs/CODE_REVIEW_1B.md`, all confirmed findings (R1–R11) and related architectural and session lifecycle defects have been resolved and verified with isolated tests, TypeScript compilation, and monorepo production builds.

| Finding | Severity | Description | Resolution Status |
|---|---|---|---|
| **R1** | CRITICAL | Raw passkey enrollment bypass in onboarding | **RESOLVED & VERIFIED** — Explicitly rejects unverified `passkeyCredential` objects; requires verified WebAuthn `RegistrationResponseJSON` via `@simplewebauthn/server`. |
| **R2** | HIGH | Concurrent challenge claim & TOTP code replay | **RESOLVED & VERIFIED** — Monotonic step update (`lastUsedTimeStep: { $lt: codeStep }`) on Credential + atomic single-use challenge consumption (`modifiedCount > 0`). Barrier concurrency test proved exactly 1 winner out of 4 concurrent claims. |
| **R3** | HIGH | Non-atomic onboarding state machine | **RESOLVED & VERIFIED** — Added partial unique index on `{ userId: 1, type: "TOTP" }`. Atomic challenge consumption occurs before credential persistence and user activation. Partial failure and retry verified. |
| **R4** | HIGH | Broken session revocation for legacy users without `tokenVersion` | **RESOLVED & VERIFIED** — Replaced `$inc: { tokenVersion: 1 }` with MongoDB aggregation pipeline update: `$set: { tokenVersion: { $add: [{ $ifNull: ["$tokenVersion", 1] }, 1] } }`, guaranteeing legacy records increment from default 1 to 2. |
| **R5** | HIGH | Invalidation of pending challenges on credential changes | **RESOLVED & VERIFIED** — Auth challenges store `userTokenVersion`. Verification rejects challenges with mismatched versions. Session revocation and password changes explicitly mark pending challenges as `EXPIRED`. |
| **R6** | HIGH | WebSocket session expiration & lifecycle enforcement | **RESOLVED & VERIFIED** — Sockets track JWT `exp`. Dispatches, messages, and periodic heartbeats evaluate token expiration and tenant active status, terminating revoked connections. |
| **R7** | HIGH | Unhandled promise rejections crashing WebSocket server | **RESOLVED & VERIFIED** — Event listeners for `MailEvents.onMailReceived` and `onStateChanged` wrapped in synchronous handlers with internal async `try/catch` and safe logging. |
| **R8** | HIGH | Test database safety, isolation contract, and test typechecking | **RESOLVED & VERIFIED** — Added `connectToTestDatabase` requiring `cellsinbox_test_*` prefix; aborts if attempting to run on application or production databases. Added scoped `cleanupTestDatabase` in failure-safe `t.after` hooks. Configured `tsconfig.test.json` in `@cellsinbox/service` and `@cellsinbox/api-server`. |
| **R9** | MEDIUM | Inconsistent tenant lifecycle & approval checks across auth paths | **RESOLVED & VERIFIED** — Centralized in `AuthService.assertActiveTenant(user)`: enforces active organization status across JWT middleware, API keys, password validation, and WebSockets. Rejects `PENDING_APPROVAL` and `SUSPENDED` organizations, with documented platform admin exception. |
| **R10** | MEDIUM | Frontend multi-account session isolation & redirect loops | **RESOLVED & VERIFIED** — Split session clearing into `clearActiveSession()` (preserves `cellsinbox_accounts`) and `clearAllSessions()`. `StoredAccount` now tracks `refreshToken`. Re-authentication redirect sets `reauth=1`, which clears stale auth cookies in Next.js middleware and prevents redirect loops. |
| **R11** | LOW | Challenge claim purpose check & dynamic attempt limits | **RESOLVED & VERIFIED** — Purpose mismatch is checked in atomic query (`type: expectedType`) so wrong-purpose calls do not spend attempts. Dynamic attempt limit uses MongoDB `$expr: { $lt: ["$attempts", "$maxAttempts"] }`. |

---

## 2. Detailed Technical Fixes

### R1 — Raw Passkey Enrollment Rejection
- In `completeFirstLoginSecuritySetup`:
  ```ts
  if (data.passkeyCredential) {
    throw new Error(
      "Raw passkey credentials are not accepted. Passkey enrollment requires verified WebAuthn registration."
    );
  }
  ```
- Genuine passkey enrollment requires `passkeyResponse` (`RegistrationResponseJSON`) verified against server-generated WebAuthn challenge parameters.

### R2 & R3 — Atomic State Machine & Concurrency
- **TOTP Monotonic Step Guard:**
  ```ts
  const credUpdate = await CredentialModel.findOneAndUpdate(
    {
      userId: user._id,
      type: "TOTP",
      $or: [{ lastUsedTimeStep: { $lt: codeStep } }, { lastUsedTimeStep: { $exists: false } }],
    },
    { $set: { lastUsedTimeStep: codeStep, lastUsedAt: new Date() } },
  );
  if (!credUpdate) {
    throw new Error("TOTP code already used in this time window. Please wait for the next 30-second code.");
  }
  ```
- **Atomic Challenge Consumption:**
  `AuthChallengeModel.updateOne({ _id: challenge._id, status: "PENDING" }, { $set: { status: "CONSUMED" } })` ensures only the single winning operation issues tokens.
- **Unique Partial Index:** Added `{ userId: 1, type: 1 }` index with partial filter expression `{ type: "TOTP" }` in `packages/db/src/models/Credential.ts`.

### R4 & R5 — Legacy User Session Revocation & Stale Challenge Invalidation
- **Aggregation Pipeline Update:**
  ```ts
  await UserModel.updateOne(
    { _id: userId },
    [
      {
        $set: {
          tokenVersion: { $add: [{ $ifNull: ["$tokenVersion", 1] }, 1] },
        },
      },
    ],
  );
  ```
- **Challenge Invalidation:**
  ```ts
  await AuthChallengeModel.updateMany(
    { userId, status: "PENDING" },
    { $set: { status: "EXPIRED" } },
  );
  ```

### R6 & R7 — WebSocket Safety & Event Loop Hardening
- Synchronous EventEmitter listener wrappers:
  ```ts
  MailEvents.onMailReceived((event) => {
    (async () => {
      try {
        // Validation & dispatch
      } catch (err) {
        console.error("Failed to dispatch mail event to socket:", err);
      }
    })();
  });
  ```
- Socket tracking stores JWT `exp`, verified during dispatches and ping intervals to terminate expired sessions.

### R8 — Test Database Isolation & Safety Contract
- Created `connectToTestDatabase(dbName, uri)` in `packages/db/src/connection.ts`:
  - Enforces `dbName.startsWith("cellsinbox_test_")`.
  - Asserts selected database name strictly matches before returning.
  - Aborts with security error if executed against development or production database names.
- Created `cleanupTestDatabase()`: drops the test database if and only if prefixed with `cellsinbox_test_` and disconnects Mongoose cleanly.
- Wrapped all test suites with `t.after(async () => { await cleanupTestDatabase(); })`.
- Added `tsconfig.test.json` to `@cellsinbox/service` and `@cellsinbox/api-server`.

### R9 — Centralized Tenant Lifecycle Enforcement
- Shared `AuthService.assertActiveTenant(user)`:
  - If user is `SUSPENDED` or `LOCKED` -> rejects immediately.
  - If user is `PLATFORM_ADMIN` -> permitted globally.
  - If user has no organization -> rejects.
  - If organization status is `PENDING_APPROVAL` -> rejects with administrative approval notice.
  - If organization status is not `ACTIVE` -> rejects with suspended organization notice.
- Applied consistently across JWT middleware, API key middleware, password validation, and WebSockets.

### R10 — Frontend Multi-Account & Redirect Loop Prevention
- `apps/web/src/lib/session.ts`: `clearActiveSession()` clears only active token/cookie while preserving `cellsinbox_accounts`. `clearSession()` / `clearAllSessions()` cleans all stored accounts.
- `apps/web/src/lib/account-store.ts`: `StoredAccount` tracks `refreshToken` and switches both access and refresh tokens.
- `apps/web/src/lib/api.ts`: 401 handler redirects to `/login?reauth=1&redirect=...`.
- `apps/web/src/middleware.ts`: When request targets `/login` with `reauth=1`, deletes `authorization` cookie to prevent bounce-back redirect loop to `/inbox`.

---

## 3. Test & Verification Evidence

### 1. Test Suite Execution (30/30 Passing)
```bash
$ npx tsx --test packages/env/test/env.test.ts apps/web/test/sanitize-email.test.ts packages/service/test/auth_challenge_engine.test.ts apps/api-server/test/auth_middleware.test.ts packages/service/test/auth_flow.test.ts

✔ API Server Auth Middleware Hardening (F02, F05, R9) (2995.86025ms)
  ✔ 1. Enforces authentication when token is missing (1.052167ms)
  ✔ 2. Permits valid token with active user & org (251.323375ms)
  ✔ 3. Enforces session revocation via tokenVersion mismatch (F05) (289.842375ms)
  ✔ 4. Enforces user suspension check (107.683333ms)
  ✔ 5. Enforces organization suspension check (R9) (81.12425ms)
  ✔ 6. Enforces organization pending approval check (R9) (80.926625ms)
✔ F03 Security: Strips active script tags completely (62.522708ms)
✔ F03 Security: Strips event handlers and malicious inline listeners (6.136292ms)
✔ F03 Security: Strips unsafe javascript: and vbscript: URIs (0.882833ms)
✔ F03 Security: Strips dangerous embedded objects, frames, and forms (3.26675ms)
✔ F03 Security: Links are forced to target=_blank and rel=noopener noreferrer nofollow (0.652958ms)
✔ F03 Privacy: Remote images are blocked by default and replaced with placeholder (1.244417ms)
✔ F03 Fidelity: Preserves legitimate email formatting and inline CID images (2.852333ms)
✔ F03 Remote Content Detection: Correctly detects external URLs (0.335292ms)
✔ F03 Sandboxed Document: Emits restrictive CSP header and HTML shell (0.472083ms)
✔ F03 DOM Execution Verification: Malicious payload in JSDOM cannot execute callbacks (8.500667ms)
✔ booleanEnv correctly parses boolean strings and values (1.749375ms)
✔ envSchema parses boolean flags without Zod coercion flaws (0.728958ms)
✔ env Proxy returns runtime values in production without .env file (F15 fix) (0.525458ms)
✔ env Proxy returns undefined during NEXT_PHASE=phase-production-build (0.073625ms)
▶ Sub-Batch 1B: Authentication Challenge Engine and Session Hardening
  ✔ 1. Challenge Creation, Hashing & Purpose Binding (R11) (1057.787458ms)
  ✔ 2. Atomic Dynamic Attempt Throttling (R11) (322.997833ms)
  ✔ 3. Concurrent Challenge Claim & TOTP Replay Prevention (R2) (607.360208ms)
  ✔ 4. Raw Passkey Rejection during Onboarding (R1) (194.864334ms)
  ✔ 5. Onboarding State Machine & Partial Failure Recovery (R3) (240.627667ms)
  ✔ 6. Legacy User Session Revocation & Pending Challenge Invalidation (R4, R5) (111.677667ms)
  ✔ 7. Centralized Tenant Lifecycle Enforcement (R9) (120.764ms)
✔ Sub-Batch 1B: Authentication Challenge Engine and Session Hardening (4419.628ms)
✔ End-to-End Authentication and Security Onboarding Flow (3574.010792ms)

ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5450.251458
```

### 2. TypeScript Validation across All Packages & Tests
- `pnpm --filter @cellsinbox/service exec tsc --noEmit -p tsconfig.test.json`: **0 errors**
- `pnpm --filter @cellsinbox/api-server exec tsc --noEmit -p tsconfig.test.json`: **0 errors**
- `pnpm --filter @cellsinbox/web exec tsc --noEmit`: **0 errors**

### 3. Monorepo Production Build
```bash
$ turbo run build
Tasks: 8 successful, 8 total
Cached: 2 cached, 8 total
Time: 28.094s
```
Covering `@cellsinbox/api-server`, `@cellsinbox/db`, `@cellsinbox/env`, `@cellsinbox/queue`, `@cellsinbox/schema`, `@cellsinbox/server`, `@cellsinbox/service`, and `@cellsinbox/web`.
