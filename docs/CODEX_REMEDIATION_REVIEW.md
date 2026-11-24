# CellsInbox — Independent authentication remediation review

Date: 2026-11-24 (Asia/Dhaka). Branch: `remediation/audit-fixes`. Reviewed HEAD: `529c5bb15aff63299bdff338a50cdf15a024617d`.

**Recommendation: REQUIRES FURTHER FIXES.**

The first-factor challenge requirement and current-user RPC checks are real improvements. They do not establish the claimed single-use, replay-proof, migration-safe, or immediately revoked session behavior. Independent tests reproduced concurrent duplicate authentication, unverified passkey onboarding, a legacy-record revocation failure, and WebSocket delivery after tenant suspension. The reported 27 tests do pass under safely isolated settings; they do not cover these failures.

## Scope, method and status definitions

The complete `529c5bb^..529c5bb` diff and all 32 changed files were inspected, including the tests and remediation claims appended to `CODEX_AUDIT_REPORT.md`. The original F01/F04/F05/F37 descriptions were used as acceptance criteria, not Gemini's new status labels. F03's earlier commit `b52b1b8` was also examined through its rendering consumers, sanitizer, iframe and tests. Adjacent unchanged registration, logout, middleware, RPC-client, database-connection and rate-limit paths were traced where necessary to verify complete workflows.

Changed-file coverage:

| Area | Files reviewed in the 1B diff |
|---|---|
| Database | `src/index.ts`, `models/AuthChallenge.ts`, `models/Credential.ts`, `models/User.ts` |
| Services | `services/AuthService.ts`, `services/UserService.ts`, `test/auth_challenge_engine.test.ts` |
| Auth RPCs | login constants/run; onboarding-complete constants/middlewares/run; passkeyAuthOptions run; passkeyAuthVerify run; totp-setup constants/middlewares/run; totp-verify constants/middlewares/run |
| User passkey RPCs | passkeyRegisterOptions run; passkeyRegisterVerify constants/run |
| API integration | `src/index.ts`, `middlewares/auth/run.ts`, `test/auth_middleware.test.ts` |
| Web | login page, security-onboarding page, `lib/account-store.ts`, `lib/api.ts`, `lib/session.ts` |
| Claims | The four newly appended original-audit status rows |

Application code was not edited. No production database, production infrastructure or third-party service was accessed. MongoDB tests used a newly started loopback-only `mongod` with its own data directory under `/private/tmp` and an explicitly selected fixture database. Submitted tests were transpiled to temporary JavaScript and workspace imports redirected to temporary builds of the reviewed source. Both database URI and database name were overridden to prevent their unsafe defaults from selecting existing data. The owned MongoDB process was shut down afterward.

Concurrency checks used real MongoDB documents and deterministic barriers around query completion to force independent reads before either request wrote its result. These barriers expose a permitted execution order; they do not replace MongoDB atomic updates with mocks. The WebSocket checks invoked the actual entry point's captured connection/message/broadcast callbacks with fixture sockets and real fixture database reads; HTTP listening and automatic seeding were stubbed. This is not a full network WebSocket integration test.

Chrome tests used a fresh temporary headless profile and a loopback fixture server. External traffic was blocked or directed to a closed local proxy. The actual sanitizer/session/account-store modules were served from reviewed source; iframe sandbox attributes matched the component. The complete Next.js application was not mounted in these browser fixtures. An isolated Next production build used a local Google Fonts fixture and disabled network access.

Status meanings:

- **VERIFIED:** the stated improvement passed the described independent check, within its stated scope.
- **PARTIAL:** an improvement exists, but the complete security/workflow requirement remains unmet or materially limited.
- **FAILED:** source or a reproducible isolated check contradicts the required behavior.
- **UNVERIFIED:** evidence is insufficient; this is not a claim that an exploit exists.

## Original finding disposition

| Original finding | Review status | Disposition |
|---|---|---|
| **F01 — onboarding bypass** | **PARTIAL** | Arbitrary userId-only completion and forged challenge tokens are rejected. Password-backed TOTP onboarding works. Raw passkey fields still activate an account without factor proof, and concurrent completions both succeed. **Do not close F01.** |
| **F04 — TOTP bypass/replay** | **FAILED** | A password-stage ticket is now required and sequential replay is rejected. Concurrent use of the same challenge/code, or the same code with different challenges, succeeds twice. **Do not close F04.** |
| **F05 — revocation/suspension** | **PARTIAL** | Normal new-record RPC revocation, current-user roles and SUSPENDED-user checks work. Legacy first revocation, existing sockets, pending/deleted tenants, logout and outstanding authentication tickets remain problematic. **Do not close F05.** |
| **F37 — session consistency** | **PARTIAL** | Access-cookie updates now accompany ordinary login/onboarding/account switching. Refresh ownership, failed writes, invalid-session recovery and server-side logout remain incomplete. Tokens are still JavaScript-readable. **Do not treat synchronization as secure session management or close F37 in full.** |
| **F03 — HTML follow-up** | **PARTIAL** | DOMPurify and an opaque sandbox materially address the original parent-origin execution path. The tested Chrome isolation/default-resource-blocking checks passed; no parent-origin execution bypass was established. Image-only rendering and broader browser/fidelity verification remain incomplete. This review does not reassert the original XSS as still reproducible. |

The original report's appended claims of verified attestation, atomic challenge consumption before token issuance, ACTIVE-only organizations and immediate WebSocket revocation are stronger than the implementation and evidence permit. This review leaves that report unchanged.

## Independently verified improvements

| Improvement | Status | Evidence and limits |
|---|---|---|
| Unpredictable, hash-at-rest authentication ticket | VERIFIED | 32 random bytes; SHA-256 lookup; expiry is checked during acquisition; direct random tickets rejected |
| Password-stage binding for TOTP and first-login TOTP setup | VERIFIED | Real login handler produced a pending-user ticket; correct bound secret completed onboarding; forged ticket failed |
| Sequential consumed-challenge rejection | VERIFIED | Submitted tests and real-signature passkey fixture reject subsequent sequential reuse |
| Normal versioned-user RPC revocation | VERIFIED | Persisted version 1 → 2 caused the old JWT to be rejected |
| Current database role on RPC requests | VERIFIED | Changing the fixture role changed the injected context even with the original JWT |
| New-record SUSPENDED-user/tenant RPC denial | VERIFIED | Submitted middleware suite passed in isolation; this does not cover all tenant lifecycle states |
| Existing passkey public-key representation | VERIFIED | A raw legacy-style base64 COSE credential with counter 0 verified a genuine locally generated ES256 assertion and advanced the counter; no browser/device enrollment ceremony was tested |
| Normal access-cookie switching | VERIFIED | Chrome observed account A's access token in both localStorage and the cookie after switching back from B |
| Tested HTML script/DOM isolation | VERIFIED | Real Chrome blocked a raw script in the sandbox while an unsandboxed control executed; parent-side access to the opaque frame was denied |
| Tested default resource privacy | VERIFIED | Actual generated CSP blocked HTTP image/CSS-image loads to the local probe server; zero probe requests occurred |

## Findings

### R01 — Unverified passkey data still bypasses mandatory factor enrollment

- **Status:** FAILED. **Severity:** HIGH. **Origin:** Incomplete F01 remediation; old raw-credential trust remains.
- **Exact file/function:** `packages/service/src/services/AuthService.ts:281`, `completeFirstLoginSecuritySetup`, especially :343–:350; `apps/api-server/src/functions/auth/onboarding-complete/{constants,run}.ts`.
- **Evidence:** With a valid FIRST_LOGIN_ONBOARDING ticket whose factorsRequired was `["TOTP"]`, the isolated check supplied only arbitrary `credentialId`, `publicKey: "not-a-valid-public-key"` and `counter: 0`. The account became ACTIVE and session tokens were returned; no TOTP credential was enrolled. This path never calls `verifyRegistrationResponse`. The required/verified-factor arrays are not enforced.
- **Impact:** A password-stage ticket holder can skip actual MFA enrollment and leave an active account with an unusable or attacker-selected credential. The new random ticket prevents the old arbitrary-userId takeover, but it does not prove enrollment. Gemini's attestation claim is false for this path.
- **Root cause:** The generic passkey-registration verification method was improved, but onboarding still saves client-supplied public-key fields directly and treats their presence as proof.
- **Recommended correction:** Remove the raw credential bypass. Bind an enrollment ceremony to the password-stage transaction, verify WebAuthn attestation/origin/RP/challenge/user and enforce the permitted factor policy before activation. Do not restore userId-only completion for compatibility.
- **Required regression tests:** Valid passkey onboarding; bogus public keys; missing attestation; wrong challenge/user/origin/RP; TOTP-required versus allowed alternative factors; zero verified factors; credential insertion failure; ACTIVE/SUSPENDED-user rejection.

### R02 — Challenge acquisition is not exclusive, and losing consumption still issues tokens

- **Status:** FAILED. **Severity:** HIGH. **Origin:** New AuthChallenge state-machine defect affecting F01/F04.
- **Exact file/function:** `AuthService.ts:121`, `claimPendingChallenge`; :174, `consumeChallenge`; :226, `verifyTotpForChallenge`; :281, `completeFirstLoginSecuritySetup`; :508, `verifyPasskeyAuthentication`; :420, `verifyPasskeyRegistration`; `packages/db/src/models/AuthChallenge.ts`.
- **Evidence:** Acquisition atomically increments attempts but leaves status PENDING, so multiple requests can acquire the same ticket. Consumption conditionally changes PENDING → CONSUMED and returns a boolean, but all successful callers ignore a false result. Real-MongoDB checks produced **two successful session responses for the same TOTP ticket/code**, and **two successful onboarding completions plus two TOTP credentials for one ticket/account**.
- **Impact:** The promised single-use boundary fails under concurrency. Factor/account side effects can duplicate before consumption, and both the winner and loser can mint a session. A unique ticket hash and atomic attempt increment do not solve this.
- **Root cause:** There is no exclusive in-progress ownership or atomic commit spanning successful factor verification, activation/enrollment and ticket consumption. The final compare-and-set result is not an issuance precondition.
- **Recommended correction:** Design an explicit atomic success transition with exactly one winner and no token issuance for losers. Make enrollment/account updates transactional or idempotently recoverable. If using a claim/lease, specify retry and crash recovery. Recheck expiry/purpose and enforce the actual policy at the appropriate final transition.
- **Required regression tests:** Concurrent success with the same ticket for TOTP/onboarding/passkey; exactly one successful issuance and enrollment; concurrent invalid/valid attempts; failure before/after factor persistence; claim expiration; crashed owner; false consume result; database failure after factor verification.

### R03 — TOTP replay protection is a non-atomic read/modify/save

- **Status:** FAILED. **Severity:** HIGH. **Origin:** New replay safeguard is insufficient for F04.
- **Exact file/function:** `packages/service/src/services/AuthService.ts:252`–:273, `verifyTotpForChallenge`; `packages/db/src/models/Credential.ts`, `lastUsedTimeStep`.
- **Evidence:** Each request independently reads the credential, compares lastUsedTimeStep, sets it and calls `save()`. Real-MongoDB barriers let both read the old step: **2/2 same-code submissions succeeded on one challenge**, and **2/2 also succeeded using different challenges for the same account/credential**. The latter remains possible even if ticket consumption alone is fixed.
- **Impact:** A valid code can authenticate more than once concurrently. The same-account replay guarantee is not enforced at the database boundary.
- **Root cause:** The freshness comparison is an application-side check on a document snapshot. No conditional update requires the persisted step to remain below the accepted code step.
- **Recommended correction:** Atomically advance the credential's accepted step only when it is newer, including a defined missing-field migration case. Coordinate that winner with challenge completion so a failure does not create an unrecoverable or duplicate authentication outcome.
- **Required regression tests:** Many parallel submissions across the same and different tickets/processes; exactly one winner per credential/time step; sequential replay; legacy credentials without the field; database retry and concurrent enrollment/reset.

### R04 — First explicit revocation can fail on existing MongoDB users

- **Status:** FAILED. **Severity:** HIGH. **Origin:** New migration regression in F05.
- **Exact file/function:** `packages/db/src/models/User.ts:47`, tokenVersion default; `AuthService.ts:58`/:69, `generateTokens`; :84, `revokeUserSessions`; `apps/api-server/src/middlewares/auth/run.ts:61`; WebSocket `validateToken` at API index :128.
- **Evidence:** A raw fixture user was inserted without tokenVersion, matching a pre-change document. Hydration supplied default 1 and a token with version 1 was issued. `revokeUserSessions` used `$inc` on the missing stored field, creating **1**, not 2. The pre-revocation token was still accepted by the real middleware. Existing versionless JWTs also take the fallback value 1 in the comparison.
- **Impact:** The first explicit revoke—and the passkey-registration path that calls it—does not reliably invalidate existing-account sessions. Fresh test fixtures all persist version 1, so they miss this upgrade case.
- **Root cause:** Mongoose's hydration default is mistaken for a persisted migration. MongoDB `$inc` on an absent field starts from zero, while token issuance/comparison assume a baseline of one.
- **Recommended correction:** Define and apply an explicit legacy initialization/cutover policy or use an atomic increment expression that applies the same missing-field baseline. Define treatment of versionless JWTs. Ensure every credential-change version advance is atomic under concurrent changes rather than computed from stale user snapshots.
- **Required regression tests:** Raw users with missing/null/existing versions; legacy JWT without tokenVersion; first and repeated revocation; first passkey registration on an old account; concurrent password/factor changes; newly issued sessions between changes; migration rerun/idempotency.

### R05 — Existing WebSockets still deliver after tenant suspension and do not expire while idle

- **Status:** FAILED. **Severity:** HIGH. **Origin:** Incomplete F05 remediation; new event checks cover only part of the boundary.
- **Exact file/function:** `apps/api-server/src/index.ts:67` and :96, MailEvents broadcast callbacks; :128, `validateToken`; :153, `registerSocket`; :189–:207, message/ping handler.
- **Evidence:** Connection authentication reads tenant state, but subsequent broadcasts read only UserModel and compare status/version. After suspending the connected fixture's tenant, an actual captured mail callback still sent `mail:received`. After explicit version revocation, a ping still returned pong and left the socket open; a subsequent mail-state event finally closed it for version mismatch. JWT expiry is checked only on authentication, and its expiry is not retained for a close timer or broadcast check.
- **Impact:** Suspension does not stop an already-connected tenant from receiving message data. Revoked idle sockets remain registered until a qualifying event; expired JWTs can continue receiving events when version/user status remain unchanged. Privilege changes have no independent socket revocation trigger unless the caller also advances tokenVersion.
- **Root cause:** Connect-time authorization and event-time authorization use different predicates; heartbeat, expiry and revocation notification are not part of connection lifetime management.
- **Recommended correction:** Apply a consistent current-user/tenant/session predicate before any data send, close at token/session expiry, and propagate revocation/suspension across all instances. Define a bounded revalidation/idle-close policy. Remove old identity registrations on reauthentication, as original F57 also requires.
- **Required regression tests:** Real socket opened before tenant/user suspension, user deletion, session revocation, role change and JWT expiry; idle and continuously pinging connections; both event types; multiple API instances; no data after revocation boundary; reauthentication A → B cleanup.

### R06 — Session synchronization preserves long-lived JavaScript-readable secrets

- **Status:** PARTIAL. **Severity:** HIGH. **Origin:** Pre-existing exposure retained by the new F37 helper; not a newly demonstrated XSS exploit.
- **Exact file/function:** `apps/web/src/lib/session.ts:9`, `setSessionTokens`; `lib/account-store.ts:66`, `saveAccount`; login `syncAuthSession`; `AuthService.generateTokens`; environment JWT lifetime defaults.
- **Evidence:** Chrome read the access token from document.cookie and the refresh token from localStorage. CDP reported `httpOnly:false`. Saved accounts also retain access tokens in localStorage. Source sets Secure when location.protocol is HTTPS, omits it on HTTP, uses host-only Path=/ and SameSite=Lax, and uses a fixed seven-day cookie age. Runtime access/refresh defaults remain 30/90 days. No refresh endpoint or rotation workflow was found.
- **Impact:** Any script executing in the application origin can obtain bearer credentials for the current and saved accounts; the long-lived refresh credential is exposed despite having no completed refresh workflow. F03 containment reduces one route to script execution but does not make localStorage or document.cookie HttpOnly.
- **Root cause:** Client JavaScript remains the session authority. A JavaScript cookie writer cannot create HttpOnly cookies, and storing the same bearer in more locations is synchronization rather than hardening.
- **Recommended correction:** Define a server-managed session/BFF or similarly explicit threat model; use server-issued Secure HttpOnly cookies where protection from script access is required, shorter access lifetimes and a real refresh rotation/revocation lifecycle. Eliminate unused refresh credentials and avoid caching multiple long-lived bearer secrets in browser storage.
- **Required regression tests:** Production HTTPS cookie attributes, JS access denial for protected credentials, expiry alignment, refresh rotation/reuse detection, logout, multiple-account ownership and credential theft containment. The HTTP fixture's `secure:false` is expected for that fixture and is not evidence that HTTPS omits Secure.

### R07 — Logout clears browser storage without invalidating the server session

- **Status:** FAILED. **Severity:** HIGH. **Origin:** F05/F37 lifecycle gap remains.
- **Exact file/function:** `apps/web/src/lib/session.ts:25`, `clearSession`; `apps/web/src/layout/header/user-dropdown/index.tsx:83`, `handleSignOut`; `AuthService.revokeUserSessions`; auth RPC inventory.
- **Evidence:** Neither logout function makes a server request. There is no logout/revoke-session RPC in this patch. `revokeUserSessions` exists as a service method and is called during passkey registration, but the browser logout path does not reach it. A comment claiming logout invalidation does not supply that connection.
- **Impact:** A copied JWT remains usable after signout until expiry or another actual version change. Other already-open clients/sockets are not logged out by clearing this browser's storage.
- **Root cause:** Local credential removal is treated as server-side session invalidation; no session identifier/store or logout protocol is implemented.
- **Recommended correction:** Implement authorized logout with explicit current-session versus all-session semantics, invalidate the server session and notify/close associated sockets, then clear client state. Preserve the ability to keep other deliberately saved accounts without retaining the signed-out account's session.
- **Required regression tests:** Reuse a captured fixture JWT after logout and require rejection; current versus all sessions/devices; open socket closure; one account signs out without accidentally activating or losing another; logout when the API is unavailable.

### R08 — Outstanding password-stage challenges survive password/session revocation

- **Status:** FAILED. **Severity:** HIGH. **Origin:** New challenge engine is not integrated with account recovery/revocation.
- **Exact file/function:** `AuthService.createAuthChallenge`, `revokeUserSessions`, `verifyTotpForChallenge`; `packages/db/src/models/AuthChallenge.ts`; `UserService.changePassword`.
- **Evidence:** An MFA_LOGIN ticket was created, the user's sessions were revoked from version 1 to 2, and the old ticket plus a valid factor still issued a **new version-2 session**. The challenge stores no authentication epoch/version and revocation does not invalidate outstanding challenges. Password changes likewise advance only the user version.
- **Impact:** A password-stage authorization obtained before credential reset/revocation can establish a fresh session afterward, if the holder can also satisfy the factor. An account-recovery action does not reliably cut off in-progress authentication using the old password proof.
- **Root cause:** Ticket validity is tied only to purpose/expiry/attempts/current ACTIVE status, not to the security state under which the password was verified.
- **Recommended correction:** Bind tickets to a credential/authentication epoch and compare it at completion, or revoke affected pending tickets atomically with credential/session changes. Specify whether explicit session revocation also cancels all pending login/enrollment ceremonies.
- **Required regression tests:** Ticket issued before password reset, factor reset, explicit recovery revoke, suspension/reactivation and role/security-policy change; old tickets must follow the documented invalidation policy and never silently inherit a new valid epoch.

### R09 — The submitted database suites are unsafe without independent isolation guards

- **Status:** FAILED. **Severity:** HIGH. **Origin:** New test infrastructure defect.
- **Exact file/function:** `packages/service/test/auth_challenge_engine.test.ts:21` and cleanup blocks; `apps/api-server/test/auth_middleware.test.ts:16`; `packages/db/src/connection.ts:11`–:24, `connectToDatabase`.
- **Evidence:** Both suites pass a URI string to a helper expecting `{uri,dbName}`. At runtime the string's uri/dbName properties are undefined, so the helper falls back to env values. The service suite overrides MONGODB_URI but not MONGODB_DB_NAME; the middleware suite does not perform that URI override. The helper always supplies dbName, which can override the database named in the URI. The service suite deletes all AuthChallenge and Credential records with `{}`. A no-network mocked connection reproduced selection of the configured original database instead of the passed test string.
- **Impact:** Running these supposedly isolated tests against an ordinary checkout can select existing application data and delete authenticators/challenges. Passing results do not establish that their database selection was safe.
- **Root cause:** Incorrect connection API usage, mutable environment assumptions, broad cleanup and no fail-closed test-database guard. This was also caught by TypeScript when tests were included.
- **Recommended correction:** Pass explicit options, allocate an owned ephemeral database/instance, verify the connected database before mutations and scope cleanup to fixture IDs. Use try/finally cleanup and make accidental non-test configuration abort before any write.
- **Required regression tests:** TEST_MONGODB_URI with an unrelated MONGODB_URI/database-name setting, no override, failed setup, cleanup failure and non-test name rejection; assert no read/write reaches a sentinel non-test database. This review ran the suites only with both settings forcibly pointed at the owned temporary instance.

### R10 — Direct organization-registration onboarding now lacks the required ticket

- **Status:** FAILED. **Severity:** MEDIUM. **Origin:** New legitimate-workflow regression from F01 caller migration.
- **Exact file/function:** `apps/web/src/app/(auth)/onboarding/organization/page.tsx:199`, `handleProceedToSecurity`; `functions/auth/register/run.ts`; security page effect :34 and `handleComplete` :99; `functions/auth/totp-setup/run.ts:36`.
- **Evidence:** Organization registration still returns userId without a challenge and navigates to `?userId=...`. The security page permits that entry and the public setup fallback generates a secret that is not stored in any challenge. Completion now sends an empty challengeToken, which the schema/service rejects. By contrast, starting through password login creates the proper bound ticket and passed the isolated service check.
- **Impact:** A newly registered administrator can scan a QR and enter a code through the advertised flow but cannot finish. The workaround is to leave the flow and perform password login. The userId fallback gives a misleading impression of backward compatibility and can lead to unnecessary authenticator entries.
- **Root cause:** Login/security callers were migrated, but registration → security was not. The secret fallback cannot produce an authorizable enrollment.
- **Recommended correction:** Route registration through a verified password-stage transaction or an equally justified server-issued initial enrollment authorization; remove the nonfunctional identifier-only setup fallback. Bind effect dependencies to challengeToken as well, so a changed ticket reloads its actual secret.
- **Required regression tests:** Browser registration → security → active session with reload; returning to an expired/changed ticket; old identifier-only links must fail honestly before showing an unusable setup; direct login-based onboarding remains functional.

### R11 — Tenant lifecycle checks are not ACTIVE-only and permit missing organizations

- **Status:** FAILED. **Severity:** MEDIUM. **Origin:** F05 partially corrected; documentation now overstates the guard.
- **Exact file/function:** `apps/api-server/src/middlewares/auth/run.ts:68` and :108; `AuthService.validatePassword`, `verifyTotpForChallenge`, `completeFirstLoginSecuritySetup`, `verifyPasskeyAuthentication`; WebSocket `validateToken`.
- **Evidence:** Real middleware accepted an ACTIVE fixture user under PENDING_APPROVAL, then accepted the same token after the tenant document was deleted. Most guards use `if (org && org.status === "SUSPENDED")`; TOTP/onboarding reject a missing org but still allow PENDING_APPROVAL. The submitted middleware suite creates its tenant through `createOrganization`, which starts PENDING_APPROVAL, yet calls the case “active user & org.”
- **Impact:** Nonapproved/orphaned tenant accounts can retain protected access and authentication behavior varies by method. The original audit's approval boundary is not restored by these checks.
- **Root cause:** “Not explicitly suspended” is treated as “exists and ACTIVE,” with different predicates across entry points.
- **Recommended correction:** Define a common lifecycle authorization rule for tenant operations and apply it consistently to password, TOTP, passkey, API key, RPC and socket paths. Preserve only explicitly justified platform-infrastructure exemptions.
- **Required regression tests:** Every organization state plus deleted/missing org for each credential path, platform-role exemptions and suspended→active transitions; test fixtures must assert their actual stored lifecycle state.

### R12 — Attempt limits are ticket-local, hardcoded and not an account-level replay/throttle policy

- **Status:** PARTIAL. **Severity:** MEDIUM. **Origin:** New challenge metadata is only partly enforced; F04 throttling is incomplete.
- **Exact file/function:** `AuthService.ts:134`–:168, `claimPendingChallenge`; `AuthChallenge.ts`, maxAttempts/factor fields; `apps/api-server/src/middlewares/rateLimit/run.ts`; auth login/totp-verify middleware configurations; TOTP step computation at AuthService :257–:263.
- **Evidence:** A challenge configured with maxAttempts=1 permitted a second claim because the query hardcodes `<5`. Purpose is checked after the counter mutation. The HTTP limiter is process-local and keyed by IP/namespace/function, not user; a fresh challenge resets the attempt budget. Installed otplib defaults are step=30 and window=0. The service separately calls Date.now after checkDelta and hardcodes 30 rather than sharing one captured epoch/step configuration.
- **Impact:** Default sequential five-attempt limiting improves the previous unthrottled route, but configurable limits and distributed/account-level throttling are not delivered. No clock-skew tolerance is configured. A time-step boundary between validation and recording is a calculation risk that still needs a dedicated test; it was not established as an observed replay exploit here.
- **Root cause:** Attempt tracking, authentication policy and clock configuration are split across unrelated mechanisms; stored policy fields are not authoritative.
- **Recommended correction:** Enforce the persisted maximum/purpose atomically, define normalized permitted-factor semantics, add account-level limits across challenges/instances and use one captured validation epoch plus explicit step/skew policy for replay tracking.
- **Required regression tests:** Nondefault maximum, wrong-purpose attempts, parallel lockout, new tickets for one account from multiple IPs/instances, exact 30-second boundary, adjacent-window codes, clock rollback/drift and sequential legitimate next-step login. Clock-skew acceptance should follow a documented policy rather than be assumed from checkDelta's existence.

### R13 — Refresh ownership, failed session writes and invalid-cookie recovery remain inconsistent

- **Status:** FAILED. **Severity:** MEDIUM. **Origin:** F37 synchronization is incomplete; some cleanup behavior broadens signout effects.
- **Exact file/function:** `apps/web/src/lib/session.ts:9`/:25; `lib/account-store.ts:90`, `switchAccount`; `lib/api.ts:43`, error handling; `src/middleware.ts`, `middleware`; `server/middleware/checkAuth.ts`; user-dropdown signout.
- **Evidence:** In Chrome, logging in A then B and switching to A produced access/cookie=A but refresh=B. No per-account refresh token is stored. Simulated localStorage write failure was swallowed, returned normally and left the previous account's cookie intact. Suspension errors are FORBIDDEN and their text does not match rpcCall's cleanup list; middleware redirects any nonempty-cookie `/login` request to `/inbox`. clearSession also removes the entire saved-account list on one matching RPC error.
- **Impact:** A future refresh implementation would act with the wrong account's credential; failed writes can navigate as the previous session without reporting failure. Suspended/stale-cookie users can be unable to reach login normally, and one expired account can erase other saved accounts. There is still no implemented refresh recovery workflow.
- **Root cause:** A single global refresh slot, independent browser writes, swallowed errors and presence-only Next middleware are used in place of an authoritative session state machine.
- **Recommended correction:** Keep refresh/session identity per account on the authoritative server, make session updates fail visibly/consistently, centralize logout/switch behavior and recover invalid cookies server-side. Use structured auth errors rather than message substrings; decide whether an error affects one account or all accounts.
- **Required regression tests:** A/B login/switch/refresh/signout, blocked/full localStorage, cookie-write failure, expired/revoked/suspended/deleted accounts, entering server-rendered protected pages first and an invalid saved account alongside a valid one.

### R14 — Passing builds omit authentication-test compile errors and the old auth suite is broken

- **Status:** FAILED. **Severity:** MEDIUM. **Origin:** New test/caller regressions masked by the existing test setup.
- **Exact file/function:** `packages/service/test/auth_challenge_engine.test.ts:21`; `test/auth_flow.test.ts:52` and :72; `apps/api-server/test/auth_middleware.test.ts:16`, :62–:64; `apps/web/test/sanitize-email.test.ts:11`; workspace package scripts/tsconfigs.
- **Evidence:** A fresh typecheck including the tests found three service-test diagnostics and four middleware-test diagnostics. These include the string connection arguments, the old userId onboarding input and a call to removed `verifyTotpCode`. A direct web-project check also finds TS5097 for the `.ts` test import without allowImportingTsExtensions. Next 15.5.29 explicitly filters `.test`/`.spec` diagnostics from its build check; backend configs include src only. Workspace test scripts remain absent.
- **Impact:** A successful build and node's stripped/transpiled test execution do not establish test type correctness or compatibility of the existing suite. The previous auth flow script can no longer exercise the remediated workflow.
- **Root cause:** Tests are outside the effective build gate, are run without typechecking and were not comprehensively migrated to the new API. This does not justify restoring the unsafe old API.
- **Recommended correction:** Establish a non-destructive, typechecked test command, update all auth fixtures/callers and configure test imports explicitly. Keep security tests in CI with actual integration coverage.
- **Required regression tests:** Test compilation must pass; deliberate failing assertions and type errors must fail CI; the old auth suite should validate the new ticket flow; real RPC registration/middleware/client/browser paths must be covered rather than direct services alone.

### R15 — F03 containment is improved, but rendering fidelity and browser claims remain incomplete

- **Status:** PARTIAL. **Severity:** MEDIUM. **Origin:** F03 follow-up; new image-only regression in the reusable detail renderer, with an existing limitation retained in the dedicated detail page.
- **Exact file/function:** `apps/web/src/components/support/email/safe-email-viewer.tsx:31` and :73; `lib/sanitize-email.ts:49`, `containsRemoteContent`, and :166, `buildSandboxedEmailDocument`; `apps/web/test/sanitize-email.test.ts`, DOM execution and CID tests; `mail-details/details-content.tsx` consumer.
- **Evidence:** hasVisibleHtml requires text remaining after tag removal, so an image-only HTML body takes the text fallback even after opt-in. The old reusable renderer displayed any nonempty HTML. Remote detection requires quoted src and can miss unquoted image references, although DOMPurify hooks/CSP still block the resulting HTTP loads by default. The JSDOM “execution” test inserts sanitized innerHTML and immediately checks a flag; it does not test iframe sandbox/CSP, wait for an image error or click the link. Its CID test proves string retention, not attachment resolution or image display.
- **Impact:** Legitimate image-only mail can disappear and users can lack the expected load-images control. The 10 tests alone do not verify the browser isolation claims. This review's additional Chrome fixtures verified the tested isolation/default-blocking behavior and found no parent-origin script escape; they do not certify every payload, browser or full app deployment.
- **Root cause:** Text-only visibility and regex detection are reused as rendering/privacy UI logic, while string/JSDOM tests are described as stronger browser evidence. The meta CSP's frame-ancestors directive must not be counted as an HTTP anti-framing control; that directive is not enforced through meta policy delivery.
- **Recommended correction:** Render valid non-text email content safely, derive remote-content state from parsed/sanitized resources, complete CID mapping and use real browser regression tests. Keep the opaque sandbox without allow-scripts/allow-same-origin. Document intentional popup behavior and use response headers for controls that require headers.
- **Required regression tests:** Full mounted viewer with image-only HTML, quoted/unquoted/relative URLs, srcset, CSS resources, CID/data/SVG images, load-images opt-in and message switching; actual browser navigation/popup/referrer/storage isolation. Chromium/Firefox/WebKit and deployment-header coverage remain UNVERIFIED, not proven failures.

### R16 — New async event handlers can reject without an application error boundary

- **Status:** FAILED by source inspection; runtime process-crash reproduction was not performed. **Severity:** MEDIUM. **Origin:** New WebSocket reliability regression.
- **Exact file/function:** `apps/api-server/src/index.ts:67` and :96, async MailEvents listeners; `packages/service/src/services/MailEvents.ts`, EventEmitter implementation.
- **Evidence:** The listeners now await database queries without try/catch. MailEvents is a standard EventEmitter without captureRejections, and emitMailReceived/emitStateChanged do not await listener promises. A rejected read therefore has no local handler; default Node unhandled-rejection behavior can terminate the API process. Closing/sending can also throw outside a contained per-socket boundary.
- **Impact:** A transient database or socket error during event fanout can interrupt the API instead of failing one connection closed. Normal ingestion/RPC callers cannot recover an asynchronously rejected listener promise through the emitter's boolean result.
- **Root cause:** Asynchronous persistence was introduced into a synchronous event fanout contract without defining error ownership and recovery.
- **Recommended correction:** Contain async listener failures, fail affected authorization checks closed, isolate per-socket errors and use a monitored retry/disconnect policy without unhandled promise rejections.
- **Required regression tests:** Inject a failed user/tenant read and a failed socket send during both event types; assert no unhandled rejection/process exit, no unauthorized send and bounded recoverable connection behavior.

## Complete workflow assessment

| Workflow | Result |
|---|---|
| First password login → TOTP setup → completion → cookie/token storage | Service path works with a valid ticket; browser session helper writes cookie; concurrent completion and raw-passkey bypass prevent approval |
| Organization registration → direct security page | Broken caller transition: no challenge; misleading identifier-only secret fallback |
| Password → TOTP challenge → session | First-factor binding and sequential checks work; concurrent replay still succeeds |
| Passwordless passkey → session | Genuine signature fixture works with old stored public-key shape; sequential replay denied; challenge consumption remains nonexclusive; real authenticator UX not verified |
| Authenticated passkey registration | Actual WebAuthn verifier exists; optional fallback selects latest pending user challenge when a token is omitted; browser registration UX, multi-tab behavior and first-revocation migration need tests |
| Current-session RPC after suspension/revoke | Current user and persisted version checks work for normal records; first legacy revoke and incomplete tenant predicates fail |
| Existing WebSocket after suspension/revoke/expiry | Tenant suspension leaks events; revoke closes only on a subsequent qualifying event; ping/idle/expiry lifetime is incomplete |
| Account switch/logout/refresh | Access synchronization improved; refresh ownership and revocation/logout incomplete; no implemented refresh rotation |

Passkey notes: The dedicated passkey authentication endpoint is explicitly passwordless; its lack of an earlier password step is not itself an auth bypass. However, a user-specific PASSKEY_AUTH challenge stores userId without enforcing it against the returned credential owner, and registration without an explicit ticket selects the latest pending registration. These are additional binding/multi-tab cases requiring regression coverage; the review did not demonstrate a takeover from either. The high-severity onboarding flaw is specifically the raw unverified credential path in R01.

## Existing-record and deployment compatibility

| Existing state | Assessment |
|---|---|
| User document without tokenVersion | Hydrated default supports initial login, but first `$inc` revocation fails as reproduced in R04; no backfill was supplied |
| JWT issued before deployment, without tokenVersion | Falls back to version 1; accepted while the hydrated/stored user version is 1. This is an implicit compatibility policy, not a deliberate forced logout. Revocation must work for it |
| Existing TOTP secret without lastUsedTimeStep | Schema hydration supplies 0 and the old secret format is unchanged. No database backfill or historic consumed-step data exists; backward-compatible first use is plausible, but this review did not run a raw legacy-TOTP-record case. Concurrent replay is proven unsafe regardless |
| Existing passkey publicKey/credentialId/counter | The stored shape is unchanged; real ES256 fixture with legacy-style raw fields verified. Real device/browser/multi-origin ceremonies and counterless/synced-passkey variations remain UNVERIFIED |
| In-progress pre-deployment in-memory passkey challenge | The old map was removed; already-issued challenges have no database counterpart and will need a restart of the ceremony. This should be an explicit rollout behavior |
| Old clients sending userId-only TOTP/onboarding inputs | Rejected by the new contract; intentionally preserving the unsafe old API would be wrong. All maintained application callers must be migrated, including registration |
| ACTIVE account with enforced flag but no enrolled credentials | Password login still falls through to token issuance based on credentials.length; the flag/policy is not checked there. This pre-existing F12 gap is not fixed by 1B |
| Multiple API replicas | Tickets now persist in MongoDB, improving restart/replica continuity. Attempt counters, replay and socket revocation remain insufficiently coordinated |

## Session security and CSRF interpretation

The cookie writer supplies SameSite=Lax and adds Secure on HTTPS, with no Domain attribute; those are real controls. It cannot supply HttpOnly through document.cookie. Refresh and saved-account secrets remain accessible to same-origin scripts. Chrome's HTTP fixture independently confirmed this readability and switching behavior; it did not test a production HTTPS termination configuration.

**No working classic cross-site POST CSRF attack was established in this review.** Current backend RPC authentication uses an explicit bearer/header or API key; it does not read the browser authorization cookie directly. Next server checks read that cookie and forward a bearer internally. Therefore “no CSRF token” is not sufficient evidence that all current RPC mutations are CSRF-exploitable. Conversely, SameSite=Lax and a wildcard CORS configuration are not a substitute for defining the trust boundary. A move to cookie-authenticated mutations/BFF must include Origin/CSRF defenses, same-site subdomain assumptions and browser tests. The present presence-only Next middleware is a navigation gate, not a trustworthy session validator.

## What the tests genuinely establish

| Submitted suite | Independently reproduced result | Coverage limitation |
|---|---|---|
| `auth_challenge_engine.test.ts` | 7 passing Node test results, including the parent result and six subtests | Sequential attempt/consume/replay, fresh fixtures and direct service calls; no concurrency, raw legacy records, passkey ceremony or full RPC/UI |
| `auth_middleware.test.ts` | 6 passing results, including the parent and five subtests | Missing/valid token, normal version mismatch and explicit suspensions; no socket, missing/pending org, migration, browser session or logout |
| `sanitize-email.test.ts` | 10 passing tests | Sanitization strings/JSDOM and generated shell assertions; no real iframe/CSP enforcement by JSDOM |
| `env.test.ts` | 4 passing tests | Earlier environment parsing work; not additional proof of the 1B authentication invariants |
| **Total** | **27 passing results** | **The count is reproducible; production-safety inference is not.** |

Independent additional checks produced 13 successful observation assertions: three positive controls and ten defect reproductions/behavior observations. These included the three real-MongoDB concurrency scenarios, raw-passkey activation, nondefault attempt limit, surviving pre-revocation ticket, legacy first revoke, missing/pending tenant authorization, existing socket behavior and incorrect test connection argument selection. “Successful observation” means the test confirmed the stated behavior, including a defect; it does not mean the security requirement passed.

Nine Chrome fixture assertions passed: sanitizer stripping, opaque origin, sandboxed script rejection with an executing unsandboxed control, default HTTP resource blocking, safe link attributes, access/refresh mismatch on account switch, JavaScript token readability, swallowed storage-write failure and the image-only visibility condition. Browser version: **Chrome 158.0.8127.37**. The last four are confirmations of limitations/defects, not security passes.

Build verification:

- Seven backend/shared source projects typechecked with fresh in-memory dependency outputs and zero diagnostics.
- The isolated Next.js 15.5.29 production build passed, with Google Fonts locally mocked and networking disabled. This confirms compilation/route generation, not authentication correctness or production deployment safety.
- Including the relevant test files produced **eight diagnostics**: three in service tests, four in API middleware tests, one in the web sanitizer test. Next's build explicitly excludes test diagnostics; backend builds include src only. Root `pnpm test` still has no workspace test scripts to execute.
- No clean dependency installation, container deployment, production proxy test, real browser WebAuthn ceremony, production TLS or production database migration was performed.

Ephemeral evidence is under `/private/tmp/cellsinbox-review-1b-RSS5mL/`: `gemini-auth.log`, `gemini-middleware.log`, `gemini-env.log`, `gemini-sanitizer.log`, `independent.mjs`, `independent-results.json`, `browser-fixture.cjs`, `browser-results.json`, and `typescript-results.json`. Original source was transpiled to that directory; no application fix or source mutation was made. Fixture MongoDB, Chrome and HTTP processes were stopped. The observations needed to assess the recommendation are recorded above, so this report does not depend on temporary artifacts surviving.

## Acceptance recommendation

Before approval, require one-winner challenge completion; atomic credential replay protection; verified onboarding passkey enrollment; a tested legacy tokenVersion policy; consistent socket suspension/expiry/revocation; working server-side logout and pending-ticket invalidation; repaired registration/session recovery paths; and safe, typechecked regression tests covering those boundaries. Record only demonstrated closure in the original audit tracking table. Unclaimed original findings, including administrative/API-key authorization, remain outside this batch's closure claim.

**REQUIRES FURTHER FIXES**
