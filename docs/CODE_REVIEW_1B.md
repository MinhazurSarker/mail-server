# Engineering review: authentication remediation, batch 1B

Review date: 2026-11-24 (Asia/Dhaka)  
Branch and reviewed HEAD: `remediation/audit-fixes`, `529c5bb`  
Comparison: `197b6ff` (`529c5bb^`) → `529c5bb`  
Recommendation: **Request changes.**

## Scope and evidence

Reviewed the commit's 32-file diff, then traced its callers, database schemas, RPC contracts, middleware, browser session storage, WebSocket dispatch, and tests. Requirements were checked against [GOALS.md](GOALS.md), [ADR-006](decisions/ADR-006-authentication-and-api-key-sending.md), [ADR-007](decisions/ADR-007-multi-tenant-privacy-and-hierarchy.md), and the F01/F04/F05/F37 requirements in [CODEX_AUDIT_REPORT.md](CODEX_AUDIT_REPORT.md). The audit's new “FIXED — VERIFIED” entries are claims under review, not independent evidence.

Application code was not modified. No application server was started, no database was connected, and no deployed application was contacted. The pre-existing untracked `docs/CODEX_REMEDIATION_REVIEW.md` was left untouched. Temporary diagnostic code lives outside the repository at `/private/tmp/cellsinbox-review-1b.test.mjs`.

“Confirmed” below means established by the source and/or an isolated diagnostic; it does **not** imply a production incident. Model doubles reproduce specified interleavings and failures, not a real MongoDB transaction or browser ceremony. “Potential concerns” are explicitly separated later. P1 denotes a merge-blocking correctness/reliability issue; P2 denotes an important compatibility or unfinished-contract issue.

The change makes useful progress: password-stage proof is now required for onboarding and TOTP login; onboarding TOTP secrets come from server state; challenges survive process changes; middleware reads current user roles/status; and onboarding/account switching now write the authorization cookie. However, atomic attempt counting does not establish single-use completion, passkey onboarding still lacks verification, and revocation/session lifecycle handling remains incomplete.

## Confirmed findings

### R1 — P1: Onboarding still treats raw passkey fields as verified enrollment

**References:** [AuthService.ts:313](../packages/service/src/services/AuthService.ts#L313), [AuthService.ts:343](../packages/service/src/services/AuthService.ts#L343), [onboarding-complete/constants.ts:18](../apps/api-server/src/functions/auth/onboarding-complete/constants.ts#L18), [onboarding-complete/run.ts:14](../apps/api-server/src/functions/auth/onboarding-complete/run.ts#L14).

`passkeyCredential` alone satisfies the mandatory-factor check. Its client-supplied credential ID, public key, and counter are inserted directly; the service then marks the account ACTIVE and issues tokens. This branch never calls `verifyRegistrationResponse` or verifies an onboarding-bound WebAuthn challenge. `factorsRequired: ["TOTP"]` on the onboarding challenge is not consulted either.

An isolated diagnostic supplied a valid password-stage challenge double and arbitrary passkey strings, without a TOTP code or attestation. The real completion method persisted them and returned an ACTIVE account and access token. This can leave the user active with an unusable factor and bypasses the required proof of enrollment.

**Comparison:** The raw-passkey defect existed before this commit. Requiring a password-issued challenge fixes the prior arbitrary-user-ID entry point, but does not finish F01. The audit's new claim that onboarding passkeys are strictly verified is incorrect.

**Correction:** Accept and verify a WebAuthn registration response against server-held, user-bound onboarding state. Persist only verified credential data. Until that flow exists, reject passkey-only completion explicitly.

**Missing tests:** Raw/fabricated passkey fields must not activate an account or write a credential; wrong ceremony/user/purpose must fail; genuine TOTP and genuine passkey onboarding must each activate exactly once.

### R2 — P1: Concurrent verification defeats challenge single use and TOTP replay protection

**References:** [AuthService.ts:134](../packages/service/src/services/AuthService.ts#L134), [AuthService.ts:174](../packages/service/src/services/AuthService.ts#L174), [AuthService.ts:252](../packages/service/src/services/AuthService.ts#L252), [AuthService.ts:273](../packages/service/src/services/AuthService.ts#L273), [AuthService.ts:475](../packages/service/src/services/AuthService.ts#L475), [AuthService.ts:564](../packages/service/src/services/AuthService.ts#L564).

`claimPendingChallenge` increments attempts while leaving the challenge PENDING. Several requests can therefore claim it. TOTP verification separately reads `lastUsedTimeStep`, checks it, and saves the credential. Two requests can read the same unused step and both save it. Every completion caller ignores the boolean returned by `consumeChallenge`, including the request that loses consumption.

A diagnostic synchronized two credential reads/saves for the same challenge and code. Both verification calls returned tokens even though exactly one challenge consumption succeeded. The same credential read/check/save pattern also fails to serialize a reused code across different login challenges. Passkey completion likewise does not require winning consumption before returning success; registration uniqueness alone does not make the entire ceremony atomic.

**Comparison:** The previous process-local passkey `getChallenge` synchronously removed the challenge on retrieval. The new persistent lookup introduces concurrent passkey claims. TOTP replay protection is new but only works for sequential calls; the added tests exercise sequential consumption/replay.

**Correction:** Establish one completion winner before issuing tokens and make the credential update conditional on its prior state. For TOTP, use an atomic monotonic-step predicate/update, coordinated with challenge completion so a losing request cannot consume the code or commit enrollment. Merely checking the consume result after all writes leaves R3 unresolved. Recheck expiry at the commit boundary as well.

**Missing tests:** Barrier-synchronized verification of the same challenge; the same TOTP step across two challenges; concurrent passkey verification; expiry during verification. Assert one successful completion, one committed state transition, and no token issuance by a loser.

### R3 — P1: Onboarding credential, user, and challenge writes have no atomic completion boundary

**References:** [AuthService.ts:297](../packages/service/src/services/AuthService.ts#L297), [AuthService.ts:333](../packages/service/src/services/AuthService.ts#L333), [AuthService.ts:354](../packages/service/src/services/AuthService.ts#L354), [AuthService.ts:362](../packages/service/src/services/AuthService.ts#L362), [Credential.ts:27](../packages/db/src/models/Credential.ts#L27).

Completion reads a pending user, inserts credentials, optionally hashes a password, saves the user, and finally consumes the challenge. There is no transaction, conditional pending→active update, rollback, or idempotency constraint for a user's TOTP credential.

The isolated failure-injection diagnostic made the user save fail after TOTP insertion. The challenge remained PENDING; retry inserted a second TOTP credential. Concurrent completions can also both read a pending account before either activates it, including completions from separate login challenges with different secrets/passwords. Duplicate TOTP records make subsequent `findOne` selection ambiguous.

**Comparison:** Independent onboarding writes predate the commit. The new challenge does not fix them, and its single-use claim now implies a guarantee this sequence does not provide.

**Correction:** Commit challenge completion, verified credential enrollment, password/version changes, and the pending→active transition together. Use a database transaction where supported, or a durable state machine with conditional writes, idempotency, and recovery. Define and enforce the intended uniqueness of TOTP enrollment.

**Missing tests:** Fail each write and retry; complete two onboarding challenges concurrently; fail token generation after commit. Verify one factor set, one activation/password outcome, and a documented recovery path.

### R4 — P1: First explicit revocation does not invalidate sessions for legacy users

**References:** [User.ts:47](../packages/db/src/models/User.ts#L47), [AuthService.ts:58](../packages/service/src/services/AuthService.ts#L58), [AuthService.ts:84](../packages/service/src/services/AuthService.ts#L84), [auth/run.ts:63](../apps/api-server/src/middlewares/auth/run.ts#L63).

Existing documents created under the parent schema have no persisted `tokenVersion`. The new Mongoose default hydrates those users as version 1, and middleware interprets legacy tokens without a version as version 1. But `$inc: { tokenVersion: 1 }` on a missing database field creates **1**, not 2. Consequently, the first `revokeUserSessions` call leaves the effective version unchanged. Passkey registration calls this method.

An isolated diagnostic used actual Mongoose hydration/query casting with a collection double implementing the missing-field increment. It generated a version-1 token, executed the real revocation method, and confirmed the real middleware still accepted that token afterward. No migration is included in the commit.

**Correction:** Backfill versions before relying on increments, or use an atomic update that increments the same effective default used by verification. Keep the legacy-token compatibility policy explicit.

**Missing tests:** A raw legacy user document with no version; a pre-commit JWT without a version; first revocation must reject both legacy and newly minted version-1 sessions. Repeat for passkey enrollment and WebSocket validation.

### R5 — P1: Revocation/password changes do not invalidate pending password-stage challenges

**References:** [AuthChallenge.ts:11](../packages/db/src/models/AuthChallenge.ts#L11), [login/run.ts:42](../apps/api-server/src/functions/auth/login/run.ts#L42), [AuthService.ts:230](../packages/service/src/services/AuthService.ts#L230), [AuthService.ts:275](../packages/service/src/services/AuthService.ts#L275), [UserService.ts:134](../packages/service/src/services/UserService.ts#L134).

A login challenge stores a user ID and purpose but no credential/session version. Password changes and explicit revocation change the user version without cancelling pending challenges. A password-stage ticket obtained before that change can still complete with a valid TOTP code; completion reads the updated user and mints tokens at the **new** version.

The diagnostic created pending challenge state, advanced the user version from 1 to 2, then ran the real TOTP verifier. It returned a valid version-2 token using the old ticket. This is a revocation boundary gap; it does not mean a challenge alone replaces the required TOTP proof.

**Comparison:** Password-bound challenges and session revocation are both new here, but their lifecycles are not connected.

**Correction:** Bind password-stage challenges to the user's credential/version generation and reject stale generations, including at final completion. Invalidate outstanding relevant challenges on credential changes/revocation.

**Missing tests:** Password change, factor replacement/removal, and explicit revocation between login stages; revocation racing final completion. Old tickets must not mint a current-generation session.

### R6 — P1: Established sockets still deliver after tenant suspension or JWT expiry

**References:** [index.ts:67](../apps/api-server/src/index.ts#L67), [index.ts:96](../apps/api-server/src/index.ts#L96), [index.ts:128](../apps/api-server/src/index.ts#L128), [index.ts:153](../apps/api-server/src/index.ts#L153), [index.ts:206](../apps/api-server/src/index.ts#L206).

Connection authentication checks the JWT and tenant once. Later mail dispatch checks only user ACTIVE status and version. It never reads the organization and does not retain/check JWT expiry. Suspending a tenant does not increment each user's version, so an already authenticated socket continues receiving message subjects/snippets and state events. An expired JWT similarly remains sufficient until another checked condition changes. Ping does not revalidate either.

The diagnostic evaluated the actual mail-received callback with an active user, matching version, and a suspended-organization double. It sent the event without querying that organization. The expiry gap follows directly from what is stored on the socket and checked during dispatch.

**Comparison:** These established-socket gaps predate the commit; current-user/version checks improve dispatch but do not complete F05. Revocation is also event-driven, not immediate when an otherwise idle socket's user changes.

**Correction:** Retain session expiry, close at expiry, and apply current tenant/user/version rules before delivery. Provide a defined invalidation mechanism or bounded revalidation for idle sockets.

**Missing tests:** Authenticate, then suspend/delete the tenant, expire the JWT, suspend the user, or increment the version before dispatch. Verify no subsequent delivery, appropriate closure, and cleanup of idle sockets.

### R7 — P1: New asynchronous event listeners can produce unhandled rejections

**References:** [index.ts:70](../apps/api-server/src/index.ts#L70), [index.ts:99](../apps/api-server/src/index.ts#L99), [MailEvents.ts:24](../packages/service/src/services/MailEvents.ts#L24).

The two broadcast listeners changed from synchronous callbacks to async functions that await database reads. Neither catches errors. `MailEvents` is a normal `EventEmitter`; its emitters return a boolean and do not await or catch listener promises, and it does not enable rejection capture. A database read failure therefore escapes as an unhandled rejection. Under the normal Node rejection policy this can terminate the API process.

An injected read failure made the actual extracted callback reject. The process was not deliberately crashed; termination is the runtime consequence of the uncaught promise path, not an observed deployed incident.

**Correction:** Handle listener failures explicitly, with logging and a defined fail-closed delivery policy. Ensure promises and socket send/close failures cannot escape the event dispatch boundary.

**Missing tests:** Reject user/tenant reads and throw during dispatch; assert no unhandled rejection, no unauthorized delivery, and continued processing of unrelated events.

### R8 — P1: New auth tests do not safely select an isolated database

**References:** [auth_challenge_engine.test.ts:16](../packages/service/test/auth_challenge_engine.test.ts#L16), [auth_challenge_engine.test.ts:24](../packages/service/test/auth_challenge_engine.test.ts#L24), [auth_middleware.test.ts:13](../apps/api-server/test/auth_middleware.test.ts#L13), [connection.ts:6](../packages/db/src/connection.ts#L6).

Both suites call `connectToDatabase(TEST_DB_URI)`, but the API expects `{ uri, dbName }`. Runtime property lookup on that string yields no options. The middleware suite falls back to the application's environment URI/database. The service suite sets `MONGODB_URI`, but the connection helper still supplies `env.MONGODB_DB_NAME`, overriding the URI's database path. A URI named `cellsinbox_test_subbatch1b` therefore does not establish database isolation.

This is consequential because the service suite deletes **all** challenge and credential documents before and after running. Cleanup is not registered in a failure-safe hook. Its user cleanup regex also expects `@test-subbatch1b.local`, while generated addresses use `@<orgSlug>.test-subbatch1b.local`, leaving users behind. The suites' positive organization setup uses `createOrganization`'s pending-approval default without activating it, so it also fails to demonstrate the claimed active-tenant boundary.

Direct typechecks confirmed TS2559 at both incorrect connection calls. The middleware suite additionally has TS2339 errors when reading fields from its unknown-typed auth context. Backend tsconfigs include only `src`, so ordinary builds miss these test errors. The two suites were **not executed against a database** during this review.

**Correction:** Pass an explicit, unique disposable `{ uri, dbName }`, guard database identity before destructive cleanup, and use failure-safe teardown. Keep cleanup scoped or drop only a database created by the suite. Typecheck and wire these tests into the test command; no service/API test script currently discovers them.

**Missing tests:** Verify selected database identity before writes, prove non-test database sentinels survive, and test teardown after an injected assertion/setup failure. Run suites concurrently against separate disposable databases.

### R9 — P2: Tenant existence/approval enforcement remains inconsistent across auth paths

**References:** [auth/run.ts:71](../apps/api-server/src/middlewares/auth/run.ts#L71), [auth/run.ts:109](../apps/api-server/src/middlewares/auth/run.ts#L109), [AuthService.ts:245](../packages/service/src/services/AuthService.ts#L245), [AuthService.ts:537](../packages/service/src/services/AuthService.ts#L537), [index.ts:138](../apps/api-server/src/index.ts#L138).

JWT/API-key middleware, password validation, passkey authentication, and socket connection checks reject SUSPENDED organizations but allow a missing organization or PENDING_APPROVAL. TOTP/onboarding reject a missing organization, but still accept pending approval. This contradicts the claimed `org.status === "ACTIVE"` guarantee and the approval boundary in ADR-007.

The diagnostic confirmed the real JWT middleware accepts both a missing organization and PENDING_APPROVAL. Thus an account with existing factors can behave differently depending on which authentication path it uses.

**Comparison:** The fail-open organization predicates mostly predate this commit. They remain relevant because F05 is explicitly marked complete and these checks were expanded here.

**Correction:** Share a lifecycle predicate requiring an existing ACTIVE tenant for tenant-scoped credentials, with explicitly documented platform-admin exceptions.

**Missing tests:** Deleted, missing, pending, active, and suspended organizations across JWT, API key, password, TOTP, onboarding, and sockets; platform-admin exceptions tested independently.

### R10 — P2: A single invalid session now erases every saved account

**References:** [api.ts:44](../apps/web/src/lib/api.ts#L44), [session.ts:25](../apps/web/src/lib/session.ts#L25), [account-store.ts:90](../apps/web/src/lib/account-store.ts#L90).

Every recognized authentication failure calls `clearSession`, which now removes `cellsinbox_accounts` along with the active session. In a browser with accounts A and B, expiry/revocation of A therefore deletes B's independently valid saved session. Previously this error path cleared the active access token/cookie while retaining the account list.

This is also sensitive to in-flight requests: a request sent under A can fail after the user switches to B, and its error handler clears B without checking which token failed. The all-accounts removal was confirmed directly with the real session helper; the cross-account request interleaving still needs an integration test.

**Correction:** Distinguish invalidating the session used by a failed request, removing one account, and explicitly signing out all accounts. Before clearing active state, compare it with the request's original session.

**Missing tests:** A expires while B remains valid; switch to B while an A request is pending and then reject A; explicitly remove one account versus all accounts. Verify cookie, active ID, account list, and RPC token together.

### R11 — P2: Configurable challenge attempt limits are ignored

**References:** [AuthService.ts:96](../packages/service/src/services/AuthService.ts#L96), [AuthService.ts:114](../packages/service/src/services/AuthService.ts#L114), [AuthService.ts:139](../packages/service/src/services/AuthService.ts#L139), [AuthService.ts:436](../packages/service/src/services/AuthService.ts#L436).

Creation persists `maxAttempts`, but both claim paths hardcode `attempts < 5`. A challenge configured with one permitted attempt accepts a second; a limit above five is prematurely exhausted. The failure-message path reads the configured value, so behavior and errors can disagree. An isolated diagnostic confirmed the one-attempt case.

**Comparison:** This is a new internal API mismatch. Current production callers use the default five, so the immediate impact is narrower than R1–R8.

**Correction:** Either implement the stored limit in the atomic predicate or remove configurability and define one limit consistently. Include purpose in the claim predicate rather than spending an attempt before checking it.

**Missing tests:** Limits below/at/above five, invalid configuration values, wrong-purpose calls, and concurrent calls at the limit. Existing tests cover only five.

## Additional confirmed unfinished details

- **Refresh-token ownership/lifetime:** [session.ts:14](../apps/web/src/lib/session.ts#L14) retains the previous refresh token when no replacement is supplied. [account-store.ts:98](../apps/web/src/lib/account-store.ts#L98) switches access tokens without storing per-account refresh tokens. The diagnostic confirmed access token B paired with refresh token A. This predates the helper extraction, but remains inconsistent with F37's completion claim. Define per-account token pairs, or clear the refresh token when changing identity. No refresh RPC/client lifecycle exists, so a failed refresh operation was not observed; adding one without fixing ownership would expose the mismatch. The seven-day cookie also remains independent of configurable JWT expiry.
- **Invalid-cookie recovery:** [middleware.ts:27](../apps/web/src/middleware.ts#L27) still treats any nonempty cookie as authenticated and redirects `/login` to `/inbox`. [checkAuth.ts:71](../apps/web/src/server/middleware/checkAuth.ts#L71) redirects server-side failures to login without clearing that cookie. The new browser cleanup does not run server-side, and its predicates do not handle the middleware's account/tenant suspension errors (403). F37's blanket “without loops” claim is not established. Test direct navigation with stale, revoked, and suspended-account cookies; implement a recovery path that can actually reach login. Do not indiscriminately treat ordinary permission-denied 403s as session failures.
- **Old test contract broken:** [auth_flow.test.ts:50](../packages/service/test/auth_flow.test.ts#L50) still passes `userId`/`totpSecret` to onboarding, and line 72 calls the removed `verifyTotpCode`. Update it to use real password-stage challenges and account for TOTP code consumption. It currently connects to configured infrastructure, so it was not run.
- **Onboarding compatibility:** The public [totp-setup/run.ts:37](../apps/api-server/src/functions/auth/totp-setup/run.ts#L37) still accepts the old user-ID-only path and generates an unbound secret, but completion now requires a challenge and ignores the old supplied secret. Restart legacy onboarding explicitly rather than displaying a setup flow that cannot complete. The onboarding effect at [page.tsx:34](../apps/web/src/app/(auth)/onboarding/security/page.tsx#L34) reads `challengeToken` but its dependency list at line 76 omits it; replacing the query token while mounted will not reload the associated secret. Add navigation/expiry/restart coverage.
- **Tracking overstates verification:** [CODEX_AUDIT_REPORT.md:779](CODEX_AUDIT_REPORT.md#L779) should describe F01/F04/F05/F37 as partial until the above boundaries are fixed and tested. Onboarding does not verify raw passkeys, completion is not atomic, established sockets do not enforce tenant/expiry lifecycle, and browser-session handling has no demonstrated end-to-end coverage. No tracking/application files were changed by this review.

## Potential concerns requiring further isolated integration evidence

1. **Lost version increments:** Password/factor changes use read→`tokenVersion + 1`→save, unlike `revokeUserSessions`' atomic increment ([UserService.ts:136](../packages/service/src/services/UserService.ts#L136), [AuthService.ts:598](../packages/service/src/services/AuthService.ts#L598), lines 618/668). Concurrent changes can compute the same next version or overwrite a newer value. Use atomic version updates coordinated with credential writes, and test a session issued between two concurrent changes. This review did not exercise real MongoDB write interleavings.
2. **Passkey counter races/account binding:** [AuthService.ts:559](../packages/service/src/services/AuthService.ts#L559) saves a counter from a read snapshot without a conditional prior-counter predicate. Test simultaneous assertions, especially nonzero counters. Also test that an email-bound `PASSKEY_AUTH` challenge cannot complete for another credential owner: the new challenge stores `userId`, but verification does not compare it with `cred.userId`. A valid credential proof is still required; this review does not establish unauthorized access from that omission.
3. **Socket registration races:** Connection validation now adds database awaits before message/close listeners are attached. Test a client that closes during validation or immediately sends auth; also reauthenticate one socket as a second account. `registerSocket` does not remove the prior user mapping, and close cleanup removes only the latest user. Some registration cleanup issues predate this commit. No local server was started to measure these interleavings.
4. **Storage failure consistency:** The session helper catches storage errors and reports success to its caller. A failed localStorage write can prevent cookie write/clear, while a rejected cookie write may not throw. Test disabled/quota-limited storage and rejected cookies before claiming synchronized persistence. No browser storage failure was induced during this review.

## Checks performed and limits

| Check | Result | Interpretation |
| --- | --- | --- |
| `pnpm --filter '!@cellsinbox/web' --workspace-concurrency=1 -r build` | PASS; seven selected workspace projects | Backend/library TypeScript builds succeed. Test directories are outside those build configs. |
| `INTERNAL_API_URL=http://127.0.0.1:9 NEXT_PUBLIC_API_URL=http://127.0.0.1:9 NEXT_TELEMETRY_DISABLED=1 pnpm --filter @cellsinbox/web build` | PASS; Next.js 15.5.29 | Production web compilation/build succeeds. API destinations were overridden to unused loopback, with no backend started. This is not browser-flow verification. |
| `pnpm --filter @cellsinbox/web exec tsc --noEmit --incremental false` | FAIL; TS5097 in `test/sanitize-email.test.ts:11` | The test imports a `.ts` path without `allowImportingTsExtensions`. The same import exists in the parent commit, so this is a pre-existing check failure, not a regression introduced by `529c5bb`. |
| `node --experimental-strip-types --test packages/env/test/env.test.ts apps/web/test/sanitize-email.test.ts` | PASS; 14/14 | Existing environment and sanitizer tests are isolated and ran successfully. They do not validate the new auth flows. |
| Standalone typecheck of each new auth suite | FAIL | TS2559 at both connection calls; API suite also reports TS2339 at lines 62–64. See R8. |
| `node --test /private/tmp/cellsinbox-review-1b.test.mjs` | PASS; 9/9 diagnostic checks | Checks assert the defective behaviors described above. Passing here confirms reproductions; it is not a green authentication regression suite. Models/collections were doubled, session code transpiled into a VM, and the real dispatch callback evaluated in isolation. No network/database access. |
| `git diff --check` | PASS | No tracked whitespace diff was present before writing this review. |

The standalone auth-suite typecheck command was run from each respective package with `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop --skipLibCheck test/<suite>.test.ts`.

The nine diagnostic checks covered raw passkey activation; concurrent TOTP completion with one consumption winner; partial onboarding failure/retry; custom attempt limits; stale password-stage challenges after a version change; missing/pending tenants; refresh/account-list storage behavior; first legacy-user revocation; and socket dispatch/error behavior. Actual MongoDB transactions, WebAuthn browser ceremonies, and full browser cookie/navigation flows remain unverified. The new database-dependent suites and older environment-dependent service tests were deliberately not run against configured infrastructure.

Before merge, prioritize R1–R8, establish disposable database test isolation, and add regression coverage at the service/RPC/browser boundaries. Build success and sequential helper tests alone do not substantiate the remediation guarantees.
