# CellsInbox engineering audit

Audit date: 2026-11-24 (Asia/Dhaka). Source revision: `26015a86d2a3cd2858c877ee1e492ca43c66e846`. The working tree was clean before review.

Findings: **58 total — 3 critical, 33 high, 22 medium.**

**Assessment: the current implementation does not support the repository's “100% verified” or “production ready” claims.** Authentication bypasses, missing administrative authorization, unsafe email rendering, delivery integrity defects, and incomplete user workflows are present even though production source typechecks and the isolated Next.js build succeeds.

## Scope and evidence standard

This was a read-only application audit. Only this report was added to the repository. No application fixes, dependency installation, database connections, application server startup, production probes, penetration tests, real email delivery, DNS lookups, or third-party service requests were performed. Compiler/build artifacts and the audit harness were written under `/private/tmp`, except compiler outputs that were held entirely in memory. Network connections and `fetch` were disabled in the isolated Next.js build; Google Fonts used a local mock.

The review started with the workspace structure and followed the 63 RPC handlers, their middleware/schema/service paths, all database models, SMTP and queue entry points, and the reachable webmail/admin/auth/settings/calendar routes. The large inherited UI component library was searched for integration and mock behavior; unrelated demo components were sampled rather than reviewed line by line. This is comprehensive workflow coverage, not a claim that every one of the approximately 88,000 frontend source lines was individually reviewed.

Confirmation labels:

- **CONFIRMED — source:** directly established by implementation and its callers/contracts. Runtime consequences are explained with prerequisites; they were not exercised against a real account or infrastructure.
- **CONFIRMED — offline check:** original TypeScript was transpiled in memory and invoked with stubbed persistence/transports, or a local compiler/build check established the result. This confirms the stated logic, not a complete deployment.
- **UNVERIFIED:** a capability or environment-dependent outcome could not be established within the authorized local-only scope. Unverified features are not counted as proven failures.

Severity: **CRITICAL** means an authentication/privilege boundary or mailbox-origin execution boundary fails; **HIGH** means substantial confidentiality, delivery, persistence, or core workflow failure; **MEDIUM** means a bounded functional/reliability defect or an important missing safeguard; **LOW** would mean a minor issue. Priorities reflect the code, not assumed public exposure.

## Repository and workflow map

| Package | Responsibility reviewed | Main concerns |
|---|---|---|
| `apps/server` | SMTP recipient validation and DATA ingestion; TLS bootstrap | Missing sender checks, unenforced stream limit, incomplete recipient lifecycle checks |
| `apps/api-server` | 63 RPC handlers, schemas, auth/rate middleware, WebSocket broadcaster | Authentication bypass, missing admin roles, inconsistent tenant targeting, incomplete contracts |
| `apps/queue` | Polling outbound delivery worker | Unclaimed jobs, batch failure isolation, no visible recovery/DSN workflow |
| `apps/web` | Login, onboarding, mailbox, composer, contacts, calendar, settings, tenant/platform administration | Missing RPC operations, silent mocks, cookie/token divergence, unsafe HTML |
| `packages/service` | All service classes and automatic seeder | Delivery/storage consistency, missing policy enforcement and authorization |
| `packages/db` | Connection lifecycle, all 13 models, indexes | Non-atomic aggregate writes, storage references, migration collection mismatch |
| `packages/schema` | Shared domain/user/message/storage contracts | Runtime validation is much weaker or absent at several RPC boundaries |
| `packages/env` | dotenv discovery, runtime validation/defaults | Production environment-only execution returns undefined configuration |

Traced workflows:

1. SMTP RCPT → hosted domain/user → DATA → MIME parsing → blob writes → message/body/attachment/state documents → event → browser. Breaks include F23–F25, F18, and F16.
2. Browser compose → `mail.send` → SENT state → internal INBOX or outbound queue → MX/relay → recorded outcome. Breaks include F10, F18–F22, F26–F27, and F31.
3. Password → initial login → onboarding/TOTP/passkey → tokens → middleware → RPC/WebSocket. Boundaries fail in F01–F06 and F11–F15; UI session continuity fails in F37.
4. Tenant creation → domain DNS instructions → verification → mailbox creation → storage setup → governance. Breaks include F02, F08, F14, F18, F42–F45.
5. Contacts/calendar/profile → list/details/edit/delete → reload. Core service operations exist, but client persistence and contract defects occur in F35–F41.

## Feature coverage matrix

`WORKING` is restricted to the stated inspected or offline-tested unit. It does not certify an end-to-end production workflow.

| Functionality | Status | Evidence / limitation |
|---|---|---|
| Production source TypeScript, eight packages | WORKING | Zero diagnostics with fresh in-memory dependency declarations |
| Next.js production compilation and route generation | WORKING | Isolated build exit 0, Next 15.5.29; offline font fixture; no deployment verification |
| JWT signing and signature verification | WORKING | Valid fixture accepted, altered signature rejected; lifecycle authorization remains broken |
| Template variable extraction/interpolation | WORKING | Offline positive checks; delivery and permission limits remain partial |
| Contact mutation ownership predicate | WORKING | Update includes both contact ID and user ID; DB execution unverified |
| Password hashing/credential comparison | PARTIAL | Argon2 calls exist; surrounding login/enrollment lifecycle fails |
| Password + TOTP login | BROKEN | No password-stage proof on TOTP endpoint; F04 |
| First-login mandatory MFA | BROKEN | Public onboarding can issue tokens without enrolling a factor; F01 |
| Passkey registration/authentication service path | PARTIAL | Library verification and challenges exist; onboarding UI and lifecycle gaps; browser ceremony UNVERIFIED |
| Enforced MFA policy, factor recovery | BROKEN | Last factor can be removed; no recovery-code workflow; F12 |
| Organization approval and suspension | BROKEN | Public registration activates immediately; middleware skips suspension; F05/F14 |
| Admin role and tenant authorization | BROKEN | Mailbox users can create admins/change storage; F02/F08 |
| API key hashing, expiry, revocation | PARTIAL | Implemented, but scopes and permissions fail; F06/F07 |
| API key rate limiting | PARTIAL | Double charging, alternate routes, process-local counters; F06 |
| SMTP local-recipient routing / anti-relay structure | PARTIAL | Hosted verified domain plus user required; no live protocol test; lifecycle/status gaps |
| SMTP SPF/DKIM/DMARC/spam evaluation | MISSING | No verifier invocation; display invents pass; F24 |
| SMTP maximum size / bounded memory | BROKEN | `sizeExceeded` ignored and whole payload buffered; F23 |
| Inbound MIME parsing and normalization | PARTIAL | Real parser/writes exist; headers omitted and persistence non-atomic; F18/F23/F24 |
| S3/R2 object upload/read/presign plumbing | PARTIAL | SDK calls exist; credential ownership/migration/delivery gaps; live provider access UNVERIFIED |
| BYOS required for tenant activation | BROKEN | Optional storage and local fallback accepted; F14/F16/F45 |
| Local fallback storage in Compose | BROKEN | Different container filesystems, no shared persistent blob volume; F16 |
| Inbound instant WebSocket notification | BROKEN | Process-local emitter cannot cross SMTP/API processes; F25 |
| Same-process RPC state event broadcasting | PARTIAL | Implemented; client operation mismatch and connection lifecycle defects remain |
| WebSocket unmount/reauthentication lifecycle | BROKEN | Reconnect after unmount and stale socket registrations; F57 |
| Mailbox list/detail service | PARTIAL | User states scope access; attachment/BCC/state-selection defects remain |
| Attachment downloading with local fallback | BROKEN | Server file URL returned to browser; usable content RPC not integrated; F58 |
| Webmail star/read/delete operations | BROKEN | Frontend names absent from RPC registry; F30 |
| Webmail filters, counts, attachment indicator | BROKEN | Contract/case/parameter mismatches; F32 |
| Mailbox pagination and bulk selection | BROKEN | Inert pagination; controlled selection not updated; F33 |
| Compose plain message | PARTIAL | Calls implemented send route; recipient/delivery/consistency gaps remain |
| Compose attachments and priority | BROKEN | Browser Buffer and backend contract defects; F31 |
| BCC privacy | BROKEN | Shared stored message exposes BCC to recipients; F10 |
| Reply/thread/reference handling | PARTIAL | Subject prefill exists; body nesting and reference propagation fail; F22/F31 |
| Draft save/restore/autosave | MISSING | DRAFTS enum/count exists; no persistence RPC/composer workflow; F53 |
| Raw EML viewing/export | BROKEN | Missing RPC and fabricated fallback; outbound raw blob absent; F26/F34 |
| Local recipient delivery across tenants | PARTIAL | Shared source-tenant message, wrong attachment storage resolution; F27 |
| Outbound queue creation and polling | PARTIAL | Real documents/worker; no atomic claim; F19 |
| Direct MX / DKIM transport | PARTIAL | Real Nodemailer/DKIM configuration; header/attachment/failover bugs; actual wire delivery UNVERIFIED |
| MX resilience, retry classification, bounce/DSN | BROKEN | First MX only, generic retries, no DSN or operational recovery; F20 |
| SES / smart-host fallback | PARTIAL | Connector code exists; DNS failure skips tenant SES, environment propagation incomplete; actual credentials/delivery UNVERIFIED |
| User administration create/list | PARTIAL | Persistence exists but authorization/domain checks fail; F02/F08 |
| User edit/quota/password reset UI | BROKEN | Local state/success text only; F36 |
| Profile/security/settings UI | BROKEN | Demo identity, local edits, unbound password/2FA callbacks; F35 |
| Contacts create/edit/delete service and UI | PARTIAL | RPC plumbing exists; favorites/pagination/detail limit broken; F39 |
| Recipient autocomplete UI | MISSING | Search RPC exists but active composer does not call it; F53 |
| Calendar CRUD | PARTIAL | RPC persistence exists; mocks, dates and error fallbacks break fidelity; F40/F41 |
| Calendar invitations, RSVP, recurrence execution | MISSING | Fields/service RSVP helper exist; no invitation transport or RSVP RPC/UI; no recurrence expansion; F53 |
| Tenant branding | PARTIAL | Resolver/login call exists; root layout requests invalid RPC URL; F46 |
| Tenant-specific governance navigation/writes | BROKEN | Read target and write target diverge; F42 |
| Storage connection test during registration | BROKEN | Hardcoded success and latency; F45 |
| Server readiness/queue monitoring | PARTIAL | Liveness endpoint exists; port 25 health is hardcoded; no queue monitor; F47/F53 |
| SMTP STARTTLS with configured certificate | UNVERIFIED | Load/update code exists; no socket/certificate handshake performed; documentation mount mismatch F49 |
| Container image build/start and reverse-proxy reachability | UNVERIFIED | Not executed; packaging/configuration defects established statically; F15/F16/F48/F49 |
| MongoDB/S3 failure recovery and backup/restore | UNVERIFIED | No live failure tests; atomicity/retention defects F18/F28/F56 |
| Lint automation | BROKEN | Exit 1 and ESLint initialization prompt; F51 |
| Automated integration test command | MISSING | No workspace `test` script; existing scripts not isolated; F50 |
| CalDAV, CardDAV, Sieve, IMAP/POP service | MISSING | No implementation/listener/route found; CalDAV/CardDAV/Sieve are stated goals, not completed functionality; F53 |

## Findings

### F01 — CRITICAL — Public security onboarding can issue a session for an arbitrary existing user

- **Status:** CONFIRMED — offline check and source.
- **Problem:** `auth.onboarding-complete` trusts a supplied `userId` without a prior authenticated login or onboarding challenge. It also accepts `totpToken` without `totpSecret`, enrolling nothing, and accepts raw passkey credential fields without WebAuthn verification.
- **Impact:** Knowledge of an existing user ID is sufficient for unauthorized session issuance; an optional new password can replace the account password. Existing ACTIVE or suspended accounts are not excluded.
- **Exact file/function:** `apps/api-server/src/functions/auth/onboarding-complete/{middlewares,constants,run}.ts`, `run`; `packages/service/src/services/AuthService.ts:122`, `completeFirstLoginSecuritySetup`.
- **Root cause:** Possession of an identifier is substituted for proof of first-factor authentication; input presence is substituted for verified factor enrollment.
- **Evidence:** Empty middleware chain. Offline fixture with an ACTIVE user and only `{userId, totpToken}` returned tokens and created zero credentials. No real account was accessed.
- **Recommended fix:** Require a short-lived, purpose-bound, single-use onboarding transaction issued after password verification; bind user/status/server-generated factor data and verify the actual ceremony before activation.
- **Tests needed:** No-session, wrong-user, ACTIVE/SUSPENDED, missing-secret, forged-passkey, expired/replayed-transaction and concurrent-completion rejection; legitimate TOTP/passkey setup succeeds exactly once.

### F02 — CRITICAL — Administrative RPCs authorize ordinary mailbox users

- **Status:** CONFIRMED — offline check and source.
- **Problem:** `admin.userCreate`, `domainAdd`, `domainVerify`, `storageUpdate` and `sesBackupUpdate` use `{ name: "auth" }` and only test whether `context.auth` exists. They do not require an administrative role.
- **Impact:** An ordinary mailbox user, including one authenticated by API key, can create ORG_ADMIN users or change tenant storage/relay configuration. This defeats tenant governance and can redirect future data writes.
- **Exact file/function:** Corresponding `apps/api-server/src/functions/admin/*/middlewares.ts` and `run.ts`, `run`; `apps/api-server/src/middlewares/auth/run.ts`, `run`.
- **Root cause:** Namespace/UI placement is treated as an authorization boundary; middleware roles are never supplied for these operations.
- **Evidence:** Offline `admin.userCreate.run` with `MAILBOX_USER` context forwarded `role: "ORG_ADMIN"` to the service and returned success. Other listed handlers have the same presence-only guard.
- **Recommended fix:** Centralize operation-specific role checks, disallow sending keys on administrative operations, and enforce authorization again in the service boundary.
- **Tests needed:** Role × credential-type table for every admin RPC; mailbox users and sending keys must fail before any persistence/storage call.

### F03 — CRITICAL — Untrusted email HTML executes in the authenticated application origin

- **Status:** CONFIRMED — source; browser execution was deliberately not attempted.
- **Problem:** Received MIME HTML is stored and rendered through `dangerouslySetInnerHTML` with only a remote-image regex replacement. There is no HTML sanitizer or sandboxed document boundary.
- **Impact:** Active HTML constructs such as event-handler attributes can execute when a message is opened. Access/refresh tokens and saved account tokens are script-readable in localStorage, magnifying impact across signed-in accounts.
- **Exact file/function:** `packages/service/src/services/MailService.ts:168`, `ingestInboundMessage`; `apps/web/src/app/(mail)/inbox/[id]/Component.tsx:275`, `EmailDetailComponent`; `apps/web/src/lib/account-store.ts`, `saveAccount`.
- **Root cause:** MIME parsing is mistaken for HTML safety; rendering occurs in the application DOM.
- **Evidence:** `parsed.html` flows to `body.html` and then directly to `__html`; the replacement only addresses some HTTP image tags and leaves active attributes, links and other remote resource mechanisms intact.
- **Recommended fix:** Sanitize with an explicit email-safe allowlist, isolate message rendering in a restrictive sandbox/origin, and implement comprehensive remote-resource controls. Harden session storage separately.
- **Tests needed:** Inert browser fixtures for active attributes, dangerous URLs, SVG, forms, CSS resources and remote images; confirm no script runs, origin access or unsolicited external resource load occurs.

### F04 — HIGH — TOTP login is not bound to password verification or throttled

- **Status:** CONFIRMED — source.
- **Problem:** Public `auth.totp-verify` accepts `userId` plus a code and issues tokens without a password-stage ticket. It has no rate-limit middleware and does not reject LOCKED/SUSPENDED users. Successful codes are not consumed to prevent reuse.
- **Impact:** The purported two-step path becomes a standalone six-digit authenticator login; password changes/lockout do not protect this route, and replay within a valid time step remains possible.
- **Exact file/function:** `apps/api-server/src/functions/auth/totp-verify/{middlewares,run}.ts`, `run`; `packages/service/src/services/AuthService.ts:108`, `verifyTotpCode`; login `run.ts`.
- **Root cause:** Only the browser remembers the first login step; the server does not bind the steps.
- **Evidence:** `run` loads the requested user, checks the code, and calls `generateTokens`; middleware is `[]`.
- **Recommended fix:** Require and consume a signed login challenge tied to a verified password/user, recheck account/tenant state, throttle attempts, and track accepted time steps.
- **Tests needed:** Direct second-step calls, changed/expired user state, wrong-user challenges, repeated codes, expiry and retry limits.

### F05 — HIGH — Suspension and permission changes do not invalidate sessions consistently

- **Status:** CONFIRMED — offline check and source.
- **Problem:** JWT middleware trusts embedded role/status and only checks tenant suspension inside a branch requiring `roles`. Normal endpoint middleware omits roles. Passkey verification omits user LOCKED/SUSPENDED checks; WebSockets only validate the JWT signature at authentication and retain access afterward.
- **Impact:** Suspended users/tenants and demoted roles can retain RPC or socket access until token expiry. Access tokens default to 30 days when runtime environment parsing is active.
- **Exact file/function:** `apps/api-server/src/middlewares/auth/run.ts`, `run`; `apps/api-server/src/functions/auth/passkeyAuthVerify/run.ts`, `run`; `apps/api-server/src/index.ts`, WebSocket `connection`/`registerSocket`; `AuthService.verifyAccessToken`.
- **Root cause:** Authorization state is cached in long-lived bearer claims without a revocation/version check; tenant checks depend on unrelated role-option configuration.
- **Evidence:** Offline middleware accepted a fixture SUSPENDED payload and never read the suspended organization with normal `{name:"auth"}` behavior.
- **Recommended fix:** Apply current user/tenant existence and lifecycle checks to every credential path; use session versions/revocation and socket expiry/revocation handling.
- **Tests needed:** Suspend/demote/delete after token issuance, both login methods, all protected RPCs, and already-open sockets.

### F06 — HIGH — Sending API keys have full account scope and inconsistent rate enforcement

- **Status:** CONFIRMED — source.
- **Problem:** `hasApiPermission` is never enforced. API keys authenticate as MAILBOX_USER on ordinary RPCs, including inbox reads, security-factor operations and key creation. A constrained key can create another key with arbitrary domains/limits; `mail.send` and template dispatch bypass its allowed-domain policy. `validateApiKey` and `sendProgrammaticEmail` both charge the rate counter for one programmatic send, while a template batch can send many recipients after one authentication charge.
- **Impact:** A sending key becomes a broad account/tenant credential, can expand privileges or outlive revocation through child keys, and does not have the advertised sending/rate scope.
- **Exact file/function:** `apps/api-server/src/middlewares/auth/run.ts`, `run`; `functions/apiKey/create/run.ts`; `functions/apiKey/sendTemplate/run.ts`; `packages/service/src/services/ApiKeyService.ts:138`, `checkRateLimit`/`validateApiKey`/`sendProgrammaticEmail`; `TemplateService.sendTemplateBatch`.
- **Root cause:** Credential type, operation scopes, key delegation, sending permission and recipient budgets are not modeled as an enforced authorization policy. Counters are process-local.
- **Evidence:** No handler-level `isApiKey` restriction on the listed account operations; caller controls `allowedDomains` and rate; template dispatch invokes `MailService.sendMail` directly.
- **Recommended fix:** Make sending keys operation-scoped and non-delegating, enforce granted permission/domain subsets, charge one defined budget at a shared enforcement point, and account for batch recipients.
- **Tests needed:** Key denied on mailbox/security/admin/key-management RPCs; constrained sender/recipient budgets across direct, template, concurrent and multi-instance paths; verify one request is not double charged.

### F07 — HIGH — Programmatic sender domains are not checked against tenant ownership

- **Status:** CONFIRMED — source.
- **Problem:** Allowed domains are arbitrary strings and `*` allows any sender domain. No hosted/verified domain ownership check occurs when keys are created or mail is sent. JWT `apiKey.send` creates a wildcard session key when none exists and may select an expired existing key without validating expiry.
- **Impact:** Users can submit mail claiming unrelated sender domains. Local messages can impersonate unrelated addresses even if external delivery is later rejected or lacks DKIM.
- **Exact file/function:** `packages/service/src/services/ApiKeyService.ts:57` and `:191`, `createApiKey`/`sendProgrammaticEmail`; `apps/api-server/src/functions/apiKey/send/run.ts`, `run`.
- **Root cause:** Client-selected key metadata is treated as authoritative domain ownership; the virtual-session path bypasses key validation.
- **Evidence:** Domain authorization is only `allowedDomains.includes("*") || includes(senderDomain)`; no `DomainModel` lookup in these service methods.
- **Recommended fix:** Resolve verified tenant domains, constrain key grants to them, define mailbox/from aliases, and validate expiry consistently for session-selected keys.
- **Tests needed:** Foreign/unverified/deleted domains, wildcard scope, expired session-selected key, domain removal after key creation and authorized aliases.

### F08 — HIGH — Mailboxes can be created with foreign domains and unrelated email addresses

- **Status:** CONFIRMED — source and handler offline check.
- **Problem:** `createUser` trusts `domainId` and `email` independently, without checking domain ownership, verification, or that the email suffix matches. Public organization onboarding has the same email/domain mismatch.
- **Impact:** Tenant/domain references can disagree; a tenant can reserve an unrelated address. Internal routing looks up only that address and can then deliver messages to the wrong tenant's mailbox.
- **Exact file/function:** `packages/service/src/services/UserService.ts:6`, `createUser`; `OrganizationService.ts:8`, `onboardOrganization`; `MailService.ts:648`, `sendMail`; `apps/api-server/src/functions/admin/userCreate/run.ts`.
- **Root cause:** Mongoose ObjectId refs provide no foreign-key ownership validation, and no service invariant fills the gap.
- **Evidence:** User creation checks only globally unique email before saving the supplied domain and organization; routing uses `UserModel.findOne({email})`.
- **Recommended fix:** Require an owned verified domain, canonical email validation/suffix matching, current tenant permission and quota; revalidate domain/user ownership at delivery.
- **Tests needed:** Foreign/nonexistent/unverified domain IDs, mismatched email domains, cross-tenant routing and normal verified-domain creation.

### F09 — HIGH — Attachment authorization does not bind attachment to message

- **Status:** CONFIRMED — offline check.
- **Problem:** `getAttachmentContent` authorizes a mailbox state for the supplied message, then loads any attachment by ID without verifying `attachment.messageId` matches it.
- **Impact:** Someone authorized for one message can retrieve another known attachment ID. Same-tenant storage is affected; shared local fallback can make the boundary cross-tenant. Distinct inaccessible S3 buckets can limit the latter case.
- **Exact file/function:** `packages/service/src/services/MailService.ts:544`, `getAttachmentContent`; `apps/api-server/src/functions/mail/attachment-content/run.ts`, `run`.
- **Root cause:** Independent object lookup after authorizing a different parent object.
- **Evidence:** Offline fixture authorized `own-message` and returned an attachment with `messageId: other-message`; the foreign object's key reached mocked storage and its data was returned.
- **Recommended fix:** Query attachment with both attachment ID and the authorized message ID, and resolve the correct tenant-owned storage reference.
- **Tests needed:** Other message in same tenant, other tenant with shared local storage, random IDs, missing parent and valid attachment access.

### F10 — HIGH — Internal recipients can read the BCC list

- **Status:** CONFIRMED — source.
- **Problem:** Webmail sends store To/Cc/Bcc in one Message document and attach that same document to every local recipient's mailbox. `getMessageDetails` returns `message.bcc` for all readers.
- **Impact:** To/Cc/Bcc recipients can discover confidential blind-recipient identities through the authenticated detail API, including between tenants.
- **Exact file/function:** `packages/service/src/services/MailService.ts:606`, `sendMail`; `:409`, return from `getMessageDetails`; `apps/api-server/src/functions/mail/get/constants.ts`.
- **Root cause:** Sender-private envelope data is mixed with recipient-visible message headers and shared across mailbox states.
- **Evidence:** The persisted Bcc array is neither removed nor conditioned on the viewing user before the detail response.
- **Recommended fix:** Keep blind/envelope recipients in sender-private delivery metadata; create recipient-visible views without the BCC list.
- **Tests needed:** Sender, To, Cc and multiple Bcc readers; same/cross tenant; verify both raw API responses and delivered MIME preserve BCC privacy.

### F11 — HIGH — Onboarding sends the TOTP secret to a third-party QR service

- **Status:** CONFIRMED — source; no request was made during this audit.
- **Problem:** The authenticator QR image URL sends the complete otpauth URI, containing the secret and account identifier, to `api.qrserver.com`.
- **Impact:** A third party receives a reusable authentication secret as a normal part of enrollment; enrollment also depends on external connectivity.
- **Exact file/function:** `apps/web/src/app/(auth)/onboarding/security/page.tsx:158`, `OnboardingSecurityContent` QR `<img>`.
- **Root cause:** Remote QR image generation is used for secret material despite a local `qrcode` dependency.
- **Evidence:** `data=${encodeURIComponent(otpauthUri)}` is embedded directly in the external image URL.
- **Recommended fix:** Generate the QR locally in the browser/server without transmitting the secret to another provider.
- **Tests needed:** Enrollment in an offline browser; assert no external request includes the otpauth URI or secret.

### F12 — HIGH — Mandatory MFA can be disabled and has no usable recovery workflow

- **Status:** CONFIRMED — source.
- **Problem:** Disabling the last TOTP or deleting the last passkey sets `twoFactorEnforced=false` without consulting organization policy. Login falls back to password-only when no credentials remain. Recovery-code schema support has no generation, verification or recovery UI. First-login UI offers only TOTP despite the passkey option described in docs.
- **Impact:** A tenant's mandatory MFA rule is unenforced; users who lose their only factor lack a completed recovery path. An API key's broad scope further exposes factor changes (F06).
- **Exact file/function:** `packages/service/src/services/AuthService.ts:361`, `disableUserTotp`; `:410`, `deleteUserPasskey`; `functions/auth/login/run.ts`; `packages/db/src/models/Credential.ts`; onboarding security page.
- **Root cause:** Factor management is not governed by an account/tenant security state machine.
- **Evidence:** Removal methods count remaining credentials and disable the flag; no organization policy lookup. Search found no implemented recovery-code issuance/redemption path.
- **Recommended fix:** Enforce tenant policy and recent authentication on removal, retain a verified recovery method, and complete audited recovery and first-login passkey flows.
- **Tests needed:** Last-factor removal with enforced/optional policy, lost-device recovery, revoked recovery code, replay and passkey-only first onboarding.

### F13 — HIGH — Runtime bootstrap embeds a shared private key and privileged identity

- **Status:** CONFIRMED — source.
- **Problem:** Every API/SMTP startup invokes a seeder with a committed DKIM private key, a fixed admin identity/password hash and unconditional verified-domain statuses. Password login silently promotes a particular email address to PLATFORM_ADMIN. Documented bootstrap environment fields are unused.
- **Impact:** Installations inherit shared signing material and hidden identity-specific privilege behavior. A domain marked unverified can be re-verified by a restart. Concurrent startups can race on seeding.
- **Exact file/function:** `packages/service/src/seeder.ts:3`, `seedPrimaryTenantIfMissing`; `AuthService.ts:90`, `validatePassword`; API `main` and SMTP `bootstrap`; `packages/env/src/index.ts:69`.
- **Root cause:** Development bootstrap data and owner identity special cases remain in normal production startup.
- **Evidence:** Literal PEM block and hardcoded records in the seeder; identity comparison followed by `user.role="PLATFORM_ADMIN"`. No secret values are reproduced here.
- **Recommended fix:** Replace with an explicit idempotent installation workflow, per-install generated keys and configured credentials; require deliberate role grants; rotate shared material.
- **Tests needed:** Clean install with configured admin, independent-install key uniqueness, existing unverified domain, concurrent startup and no automatic promotion by email string.

### F14 — HIGH — Public registration bypasses tenant approval and mandatory BYOS

- **Status:** CONFIRMED — source.
- **Problem:** Public `auth.register` calls `onboardOrganization`, which saves status ACTIVE and accepts optional storage/local fallback. It bypasses `createOrganization`'s PENDING_APPROVAL state and the approved tenant activation contract.
- **Impact:** Unapproved tenants can become active and use platform-local storage, contrary to stated ownership/approval/BYOS requirements. Domain verification is still needed for external SMTP intake, but does not gate activation or internal/programmatic sending.
- **Exact file/function:** `apps/api-server/src/functions/auth/register/{middlewares,run}.ts`; `packages/service/src/services/OrganizationService.ts:8`, `onboardOrganization`; `docs/GOALS.md` and ADR-005/007.
- **Root cause:** Separate tenant-creation paths implement incompatible activation rules.
- **Evidence:** Empty registration middleware; `status:"ACTIVE"`; `storageConfig: data.storageConfig || {provider:"local_fallback"}`.
- **Recommended fix:** Unify creation/approval, ownership and storage verification in one lifecycle; restrict activation to approved prerequisites.
- **Tests needed:** Public registration stays pending; unapproved tenant cannot send; failed storage/domain checks prevent activation; authorized platform approval succeeds.

### F15 — HIGH — Production processes ignore environment variables when no .env file exists

- **Status:** CONFIRMED — offline check.
- **Problem:** `isBuildTime` is true for any production process without a discoverable `.env`, not just a Next build. The `env` proxy then returns undefined for every setting even when process environment variables are valid. Boolean coercion also turns the string `"false"` into true.
- **Impact:** Conventional environment-only containers cannot read MongoDB/JWT configuration and can fail startup; SMTP silently falls back to port 2525 instead of configured 25. `API_DOCS_ENABLED=false` does not disable docs when parsing runs; SMTP_SECURE=false also becomes true.
- **Exact file/function:** `packages/env/src/index.ts:89`, `isBuildTime` and proxy `get`; `envSchema`; SMTP/API/queue entry points and DB connection consumers.
- **Root cause:** A production environment heuristic substitutes for actual build phase detection; generic Boolean coercion is used for string settings.
- **Evidence:** Offline production fixture with no env file and populated MONGODB_URI/JWT_SECRET returned undefined for both; `envSchema.parse({API_DOCS_ENABLED:"false"})` returned true.
- **Recommended fix:** Gate only on the explicit build phase, validate runtime process.env, and parse explicit boolean spellings. Fail closed on required production configuration.
- **Tests needed:** Production without files, with environment injection, with env file, real build phase and true/false string values.

### F16 — HIGH — Local fallback blobs are neither shared nor durable in Compose

- **Status:** CONFIRMED — source/configuration.
- **Problem:** Local fallback stores files relative to each process/container. Compose mounts only MongoDB data and SMTP certificates; API, SMTP and queue containers have no shared blob volume. New tenants can default to fallback.
- **Impact:** SMTP-written attachments are not available to the API container; API-uploaded attachments are not available to the queue worker; container replacement can remove blobs while MongoDB retains references.
- **Exact file/function:** `packages/service/src/services/StorageService.ts:25`, `getLocalDir` and file methods; `docker-compose.yml`, smtp_server/api_server/queue_worker volumes; `OrganizationService.onboardOrganization`.
- **Root cause:** A development filesystem mode is exposed as a production storage option without topology-aware persistence.
- **Evidence:** Default path `./storage/blobs`; three distinct Docker service filesystems and no corresponding shared named/bind volume.
- **Recommended fix:** Enforce BYOS for production as designed, or explicitly support a shared persistent storage topology with backups and tested ownership.
- **Tests needed:** Receive in SMTP/read in API/send in worker, then recreate each container and verify all referenced blobs still exist.

### F17 — HIGH — Attachment filenames can escape the local storage directory

- **Status:** CONFIRMED — offline path calculation and source; no file escape was performed.
- **Problem:** Programmatic attachment filenames are appended verbatim to generated object keys. Local upload resolves the result using `path.join` without checking containment. Registration/storage configuration also accepts arbitrary local endpoint paths.
- **Impact:** With local fallback and sufficient `../` filename segments, writes can leave the tenant/blob directory and overwrite writable application-host files. S3 mode can still write outside the intended tenant key prefix.
- **Exact file/function:** `packages/service/src/services/ApiKeyService.ts:244`, `sendProgrammaticEmail`; `StorageService.ts:75`, `uploadAttachment`; input schema `functions/apiKey/send/constants.ts`.
- **Root cause:** Untrusted display filenames participate in storage paths; endpoint/root selection is tenant-controlled without a production policy.
- **Evidence:** Offline `path.join('/fixture/storage/blobs', 'attachments/org/date/uuid-' + traversalFilename)` resolved outside the storage root. Only the path string was calculated.
- **Recommended fix:** Use opaque server-generated keys, keep filenames as metadata, enforce normalized path containment, and prohibit tenant-selected arbitrary local filesystem roots.
- **Tests needed:** Traversal separators, encoded/separator variants, absolute paths and ordinary Unicode filenames; verify no writes escape a temporary fixture root.

### F18 — HIGH — Multi-step mail and tenant writes leave partial state and duplicate on retries

- **Status:** CONFIRMED — source.
- **Problem:** Inbound delivery, sends and onboarding perform independent writes without transactions, an outbox/staging protocol, rollback, or idempotency. A later recipient/storage/body/queue failure does not undo earlier writes.
- **Impact:** SMTP retries can duplicate already-delivered recipients; webmail retries can duplicate sent/queued mail; orphan blobs and incomplete messages remain; failed onboarding can reserve a slug/domain and cannot simply be retried. SENT can be visible before every recipient is durably queued.
- **Exact file/function:** `MailService.ts:87`, `ingestInboundMessage`; `:588`, `sendMail`; `ApiKeyService.sendProgrammaticEmail`; `OrganizationService.onboardOrganization`.
- **Root cause:** A user-visible operation spans several MongoDB documents and blob writes but has no durable operation state or compensating actions.
- **Evidence:** Sequential `save/create/upload` calls and recipient loops; errors propagate after earlier side effects; no session/transaction/idempotency key. A repeated MIME Message-ID is not deduplicated by a unique delivery invariant.
- **Recommended fix:** Define atomic metadata/outbox commits, staged blob lifecycle and idempotent recipient delivery; use compensation/reconciliation where cross-store atomicity is impossible.
- **Tests needed:** Failure injection after every write, multi-recipient partial failure, crash/retry, duplicate submission and concurrent onboarding. Verify exactly the intended visible states and no lost recipients.

### F19 — HIGH — Queue jobs are fetched without an atomic claim

- **Status:** CONFIRMED — offline check and source.
- **Problem:** `fetchNextBatch` is a plain find. No worker lease, claim token or IN_PROGRESS update exists before sending; delivery also does not check that an item is still pending.
- **Impact:** Two workers can send the same job concurrently. A crash after SMTP acceptance but before database success can cause another send; generated message identities also vary (F22).
- **Exact file/function:** `packages/service/src/services/QueueService.ts:22`, `fetchNextBatch`; `MtaService.ts:314`, `processQueueBatch`; `:36`, `deliverQueueItem`.
- **Root cause:** Queue selection and ownership are not a single conditional persistence operation.
- **Evidence:** Offline concurrent batch calls returned the same fixture job with zero claim writes. IN_PROGRESS exists in the schema but is unused by the service.
- **Recommended fix:** Claim with atomic status/lease transitions, worker ownership and expiry recovery; retain a stable delivery identity and explicitly handle ambiguous SMTP acknowledgements.
- **Tests needed:** Concurrent workers, expired leases, worker death before/after acceptance, duplicate manual processing and acknowledgement-write failure.

### F20 — HIGH — Outbound failure handling lacks resilient routing and operational recovery

- **Status:** CONFIRMED — source.
- **Problem:** Only the first MX is attempted; no implicit A/AAAA fallback is implemented. DNS failure skips tenant SES fallback. SMTP 4xx/5xx/ambiguous acceptance are not classified; arbitrary codes do not change retry policy. Fetch hardcodes attempts <5 while the model supports maxAttempts. BOUNCED records generate no DSN/user notification or retry/admin workflow. An uncaught error on one item aborts the remaining batch.
- **Impact:** Recoverable delivery is abandoned or delayed; permanent rejections are repeatedly retried; custom max-attempt jobs can strand; users see SENT with no usable failure/recovery path.
- **Exact file/function:** `MtaService.ts:109`, `deliverQueueItem`; `:168`, fallback branch; `:314`, `processQueueBatch`; `QueueService.ts:22`/`:50`, fetch/failure recording; `apps/queue/src/index.ts`, `runWorker`.
- **Root cause:** Success/failure booleans substitute for an MTA delivery state machine and per-recipient diagnostics.
- **Evidence:** `mxRecords[0]`; DNS catch only considers global SMTP_HOST; failure method uses attempt count regardless of response class; repository has no DSN producer/queue management RPC.
- **Recommended fix:** Implement ordered MX attempts, standards-aware address/routing outcomes, consistent fallback selection, classified retry deadlines, per-item exception isolation and visible terminal/ambiguous delivery recovery.
- **Tests needed:** Two MXs with first unavailable, no-MX host, transient DNS, 451/550, null MX, maxAttempts above/below five, failed batch member, SES after DNS error and DSN generation without loops.

### F21 — HIGH — Missing attachment or message data can still produce successful delivery

- **Status:** CONFIRMED — offline check and source.
- **Problem:** MTA attachment read errors are logged and ignored. Missing Message/MessageBody records are replaced with a generic subject/empty body rather than failing delivery.
- **Impact:** Recipients receive incomplete or empty email while the job is marked DELIVERED. Temporary storage failure becomes permanent content loss.
- **Exact file/function:** `packages/service/src/services/MtaService.ts:45`, data lookup; `:92`, attachment loop; `:149`, send payload; fallback payloads.
- **Root cause:** Required content is treated as optional best-effort enrichment.
- **Evidence:** Offline transport stub received zero attachments after a required attachment read failed, and the service reported success. Optional chaining/default values similarly permit absent message/body records.
- **Recommended fix:** Verify the complete immutable payload before sending; classify missing/unavailable content and retain the job for repair/retry without transmitting a partial substitute.
- **Tests needed:** Unavailable blob, wrong storage config, missing message/body, corrupt attachment and restored content; ensure no SMTP send occurs until complete.

### F22 — HIGH — Outbound MIME loses identity, recipient headers and threading

- **Status:** CONFIRMED — offline check and source.
- **Problem:** Every queue recipient is rendered as a new Nodemailer message using only `from`, `to:item.recipient`, subject/body/attachments. Stored Message-ID, original To/Cc, display name, Reply-To, In-Reply-To and References are not passed. Attachment contentId is lost.
- **Impact:** Different recipients/retries see different Message-IDs and incorrect headers; BCC recipients can become the visible To address in their copy; reply threading and inline CID images break. Stored mail is not the actual sent MIME.
- **Exact file/function:** `packages/service/src/services/MtaService.ts:149`, direct `sendMail`; `:218` and `:278`, SES/relay sends; `MailService.sendMail` interface and schema.
- **Root cause:** Delivery envelope is substituted for message headers instead of using a preserved MIME payload plus a separate SMTP envelope.
- **Evidence:** Offline captured transport options omit stored Message-ID/Cc/In-Reply-To; all three delivery branches construct the same reduced payload.
- **Recommended fix:** Persist a stable recipient-safe MIME representation, preserve headers/CID relationships, and pass an explicit envelope for each delivery without rewriting visible recipients.
- **Tests needed:** Multiple To/Cc/Bcc recipients, retry and fallback identity equality, Reply-To, threaded replies and CID attachment rendering using captured local transport output.

### F23 — HIGH — SMTP size enforcement and bounded-memory ingestion are incomplete

- **Status:** CONFIRMED — offline check and source.
- **Problem:** SMTP advertises a size limit but DATA never checks `stream.sizeExceeded`. It collects all chunks, concatenates the payload, parses everything with `simpleParser`, and uploads complete buffers. Large text/HTML bodies are then saved directly into one MongoDB body document.
- **Impact:** Oversized messages can be accepted by the handler; concurrent large mail consumes multiple full-payload buffers and decoded attachment copies. A body exceeding MongoDB's document limit can fail after blobs/message metadata were already written.
- **Exact file/function:** `apps/server/src/server.ts:49`, `onData`; `packages/service/src/services/MailService.ts:92`, `ingestInboundMessage`; `MessageBody.ts`; `StorageService` buffer APIs.
- **Root cause:** Advertised protocol limit is not enforced by application DATA handling; the pipeline is buffered rather than streamed as documented.
- **Evidence:** Offline stream fixture with `sizeExceeded=true` was ingested and the application callback acknowledged success. Installed smtp-server 3.21.7 also has an automatic oversized-rejection branch, but `_isOversized` requires `options.rejectOversized`, which this application does not set and the constructed library defaults leave undefined. Source retains chunks and uses `Buffer.concat`/`simpleParser`/complete attachment buffers. No on-wire test was performed.
- **Recommended fix:** Enforce the actual DATA byte limit before acceptance, stream/spool safely with bounded concurrency/backpressure, and define limits/offloading for parsed bodies.
- **Tests needed:** Declared and undeclared oversized DATA, boundary sizes, large text-only bodies, concurrent streams, parser/storage failure and client disconnect; memory remains bounded and no partial acceptance.

### F24 — HIGH — Inbound authentication/spam policies are absent and unknown results display PASS

- **Status:** CONFIRMED — source.
- **Problem:** No SPF, DKIM, DMARC or spam evaluator runs during intake. Stored policy fields are not consumed. `getMessageDetails` and the frontend default missing results to pass. Intake also omits parsed Cc and Reply-To despite schema support.
- **Impact:** Unverified/spoofed messages appear authenticated; reject policies have no effect. Recipient/header fidelity is lost for ordinary inbound mail.
- **Exact file/function:** `apps/server/src/server.ts`, `onRcptTo`/`onData`; `MailService.ts:146`, inbound Message construction; `:418`, `getMessageDetails`; inbox detail page/Component security badges.
- **Root cause:** UI defaults and configuration persistence exist without the validation/delivery pipeline they imply.
- **Evidence:** Intake receives only rawMime/envelope fields and performs recipient checks/parsing/storage; no sender verification result is produced. Result fallback is literal `"pass"`.
- **Recommended fix:** Implement verifiers with SMTP peer/envelope context and policy handling; represent unknown/not-evaluated honestly; preserve relevant parsed headers.
- **Tests needed:** Controlled DNS/MIME fixtures for pass/fail/temporary error/alignment, forged Authentication-Results, each policy toggle and Cc/Reply-To round-trip.

### F25 — HIGH — SMTP mail events cannot reach the API WebSocket broadcaster

- **Status:** CONFIRMED — source/process topology.
- **Problem:** `MailEvents` is one in-process EventEmitter. SMTP emits in `apps/server`; sockets subscribe in the separate API process/container. There is no cross-process broker, change stream, outbox poller or periodic inbox polling fallback.
- **Impact:** Externally received messages are persisted but do not appear instantly in an already-open inbox; API replicas also cannot share notifications reliably.
- **Exact file/function:** `packages/service/src/services/MailEvents.ts:50`, singleton; `MailService.ts:191`, emit; `apps/api-server/src/index.ts`, subscriptions; `docker-compose.yml` process separation; inbox `useMailSocket`.
- **Root cause:** A local event mechanism is used as if it were a distributed transport.
- **Evidence:** All event transport code is EventEmitter registration; SMTP/API start independent Node processes. The existing mailbox test subscribes in the same process and cannot verify this boundary.
- **Recommended fix:** Use a durable event/outbox or appropriate cross-process transport, with reconnect reconciliation and a defined fallback refresh strategy.
- **Tests needed:** Separate SMTP/API processes, multiple API replicas, reconnect/missed-event replay and receiver crash after commit.

### F26 — HIGH — Outbound raw MIME keys reference objects that were never written

- **Status:** CONFIRMED — source.
- **Problem:** Webmail and programmatic sends set `s3RawKey` to generated sent/api-sent paths but never build or upload raw MIME. Only inbound ingest calls `uploadRawMime`.
- **Impact:** Sent-message source/export, replay/recovery and immutable audit copies cannot work; database references suggest content exists when it does not.
- **Exact file/function:** `packages/service/src/services/MailService.ts:615`, `sendMail`; `ApiKeyService.ts:272`, `sendProgrammaticEmail`; `StorageService.uploadRawMime` callers.
- **Root cause:** Placeholder storage keys fulfill a required schema field without fulfilling the storage operation.
- **Evidence:** Neither send method invokes MIME upload; MTA synthesizes a new message rather than reading the key.
- **Recommended fix:** Generate and persist the actual stable outbound MIME before committing the message/queue; store only verified object references.
- **Tests needed:** After both send paths, retrieve the raw object, compare decoded bodies/headers/attachments and verify retries transmit the same representation.

### F27 — HIGH — Cross-tenant internal delivery resolves attachments from the wrong bucket

- **Status:** CONFIRMED — source.
- **Problem:** Programmatic internal delivery shares the sender tenant's Message and attachment keys with local recipients in any tenant. Detail/download methods derive storage configuration from the recipient user instead of the message/blob owner.
- **Impact:** A recipient with a different BYOS bucket receives attachment URLs/read attempts against their own bucket for an object stored only in the sender's bucket. The shared document also violates the expected tenant-owned storage lifecycle.
- **Exact file/function:** `ApiKeyService.ts:296`, recipient routing; `MailService.ts:375` and `:562`, attachment config resolution; `MailService.ts:648`, shared internal Message routing.
- **Root cause:** Storage ownership is not part of an immutable attachment reference, and cross-tenant delivery does not create a recipient-owned copy.
- **Evidence:** Attachment is uploaded using API key organization config, then recipient gets the same `message._id`; reads use `user.organizationId`.
- **Recommended fix:** Define cross-tenant delivery ownership explicitly, copy/ingest into recipient storage or use strictly authorized owner-bound references without exposing credentials.
- **Tests needed:** Two tenants with distinct buckets and the same object-key namespace; recipient attachment download, sender/recipient storage change and sender deletion.

### F28 — HIGH — Changing storage configuration disconnects previously stored mail

- **Status:** CONFIRMED — source.
- **Problem:** Updating tenant storage replaces the configuration in place. Messages/attachments store only an object key, with no storage location/version. All reads use the current config, and no migration or old-location lookup exists.
- **Impact:** A successful bucket/provider/path change can make historical attachments/raw mail inaccessible and cause pending deliveries to omit attachments (F21).
- **Exact file/function:** `OrganizationService.ts:157`, `updateStorageConfig`; `MailService.getMessageDetails`/`getAttachmentContent`; `MtaService.deliverQueueItem`; Attachment/Message models.
- **Root cause:** Mutable organization settings are used as the sole resolver for immutable content.
- **Evidence:** `$set:{storageConfig:config}` and key-only blob metadata; no storage config ID/history/migration service.
- **Recommended fix:** Version storage locations and bind each object to its location; require a resumable verified migration for changing existing content storage.
- **Tests needed:** Bucket/provider/path migration with old/new messages and queued sends; interrupted migration, rollback and credential rotation.

### F29 — MEDIUM — Self-sent messages have ambiguous state updates

- **Status:** CONFIRMED — source.
- **Problem:** A self-send creates both SENT and INBOX states for the same user/message, which the unique index allows. Detail/update queries use only userId/messageId and the frontend discards state IDs in favor of message IDs.
- **Impact:** Opening or starring the inbox copy can select/update the SENT state instead; read/folder behavior and counts become inconsistent. Moving one copy into the other's folder can encounter the unique constraint.
- **Exact file/function:** `MailService.ts:343`, `getMessageDetails`; `:466`, `updateMailboxState`; `:630`/`:652`, `sendMail`; MailboxState compound index; inbox page `formatted.id`.
- **Root cause:** Per-mailbox-entry state is addressed as if user/message were unique after uniqueness was changed to include folder.
- **Evidence:** Two created states satisfy the same `findOne`/`findOneAndUpdate` predicate; state identity is not kept through the client.
- **Recommended fix:** Address state mutations by authorized mailboxStateId and define separate send/receive-copy semantics.
- **Tests needed:** Send to self, open/read/star each copy, move/delete one copy and verify the other remains correct.

### F30 — HIGH — Core mailbox actions call missing RPC operations

- **Status:** CONFIRMED — offline AST inventory and source registry inspection.
- **Problem:** The inbox calls `mail.updateState`, while the registered directory/function is `mail.update-state`. Delete buttons call `mail.delete`, for which no handler exists.
- **Impact:** Starring, marking read through the toolbar, bulk delete and detail delete cannot complete. The service's `deleteMessage` method is not exposed by RPC.
- **Exact file/function:** `apps/web/src/app/(mail)/inbox/page.tsx:204`, `handleToggleStar`; `:217`, `handleDeleteSelected`; `:231`, `handleMarkAsRead`; detail `Component.tsx:126`, `handleDelete`; `apps/api-server/src/functions/mail/update-state/run.ts`.
- **Root cause:** Untyped string RPC calls diverge from filesystem registration; no generated integration contract catches it.
- **Evidence:** Inventory found five unresolved call sites across updateState/delete/getRaw. Installed RPC registry derives functionName directly from its containing directory, with no camelCase alias.
- **Recommended fix:** Align operation names and expose the intended deletion contract; use shared/generated client definitions and contract checks.
- **Tests needed:** Actual RPC registry plus client tests for star/unstar, mark read/unread, trash, bulk delete and permanent delete; verify persisted state and error responses.

### F31 — HIGH — Composer attachment, priority, template and reply contracts are incomplete

- **Status:** CONFIRMED — source; browser Buffer failure follows from the missing browser import/polyfill, not an executed UI test.
- **Problem:** Both composers call Node `Buffer.from` in browser code without an import. Even with encoding supplied, `mail.send` has no attachment/priority/header inputs and forwards none to `sendMail`, which always sets hasAttachments=false. Template lists return `{items}` but composers read arrays/`templates`. Replies read `m.text`/`m.snippet` instead of `m.body`; reference headers are unsupported. The reply-loading effect depends on editable To/subject and can overwrite the draft body on those edits.
- **Impact:** Selecting an attachment can fail send; bypassing that error silently drops files/priority. Template insertion stays unavailable, reply quotes are empty, and editing reply fields can lose text.
- **Exact file/function:** `apps/web/src/app/(mail)/inbox/new/page.tsx:61`, effect and `handleSend`; `components/support/email/layout/compose-dialog.tsx`, effect/`handleSend`; `functions/mail/send/{constants,run}.ts`; `MailService.sendMail`.
- **Root cause:** UI capability was added without a matching browser-safe encoder or end-to-end send schema/storage implementation.
- **Evidence:** Attachment payloads are constructed in UI but never read by the handler; backend has no attachment parameter. API template output and reply body nesting directly contradict frontend accesses.
- **Recommended fix:** Complete browser file encoding/upload and typed send contract, persist files/priority/reference headers, normalize template/detail responses and initialize reply content once.
- **Tests needed:** Browser attach/send/download, multiple/binary/empty files, urgent headers, template insertion, quoted reply body and editing To/subject after typing a reply.

### F32 — MEDIUM — Inbox filters, counts and attachment indicators use the wrong contract

- **Status:** CONFIRMED — source.
- **Problem:** Stats return flat inboxUnread/inboxTotal/starred/etc, while UI expects `res.counts`. Sidebar sends `Starred` but the page only special-cases `STARRED`; Unread/Attachments are sent as folder names. Label selection is never added to the query or dependencies. List maps attachment presence from `m.attachments` instead of `m.hasAttachments`, and labels from `label/tags` instead of `labels`.
- **Impact:** Counts remain zero, normal Starred/Unread/Attachments views are empty or wrong, label selection does nothing, and genuine attachments/labels are hidden.
- **Exact file/function:** Inbox page `fetchStats` at :108 and `fetchMessages` at :120; `components/support/email/layout/sidebar/sidebar-body.tsx`, category definitions; mail stats/list schemas.
- **Root cause:** Several UI data models were connected with permissive `any` rather than a shared response/filter model.
- **Evidence:** Exact field/case differences above; `urlLabel` is read only for active UI selection, not fetching.
- **Recommended fix:** Normalize folder identifiers and map real stats; model virtual filters explicitly and add server/client label and attachment filtering.
- **Tests needed:** Seed known unread/starred/attachment/labeled messages and verify every sidebar view, badge and filter after reload/state change.

### F33 — MEDIUM — Mail pagination, select-all and several toolbar actions are inert

- **Status:** CONFIRMED — source.
- **Problem:** Pagination always prints `1–11`; its buttons have no handlers. Parent passes `messages.length` rather than server total. Select-all/read/unread selection changes internal state even while parent-controlled checkedIds is active. Archive, mark-all-read, filter-unread and mute controls have no action handlers.
- **Impact:** Messages after the first 50 cannot be reached through the UI; bulk selection fails; visible controls promise unavailable operations.
- **Exact file/function:** `components/support/email/mail-list/mail-pagination.tsx`, `MailPagination`; `mail-list/index.tsx`, `handleSelectAll`/`handleSelectFilter`; `mail-header.tsx`; inbox page MailList props.
- **Root cause:** Template interaction scaffolding is not wired to controlled state or paginated API metadata.
- **Evidence:** Buttons have only visual props; selection handlers call `setInternalCheckedIds` instead of parent callbacks.
- **Recommended fix:** Implement controlled selection and total/page callbacks, then connect or remove unsupported toolbar actions.
- **Tests needed:** More than 50 messages, page boundaries, select-all/unselect/read/unread selection with controlled props and every toolbar action's resulting API/persistence effect.

### F34 — MEDIUM — Raw-source viewer fabricates content after calling a nonexistent API

- **Status:** CONFIRMED — offline inventory and source.
- **Problem:** `mail.getRaw` has no RPC handler. The catch block constructs a few headers and the rendered body and presents it in the raw EML dialog.
- **Impact:** Users cannot inspect/export original headers, MIME boundaries, signatures or attachments; the fallback can be mistaken for authentic source and mislead diagnostics.
- **Exact file/function:** `apps/web/src/app/(mail)/inbox/[id]/Component.tsx:107`, `handleFetchRawEml`; mail handler inventory; F26 outbound storage defect.
- **Root cause:** Missing functionality is masked with synthetic output instead of an explicit unavailable/error state.
- **Evidence:** Missing registered `getRaw`; catch creates `From/Subject/Date/Content-Type` strings rather than reading `s3RawKey`.
- **Recommended fix:** Add authorized retrieval of the actual stored MIME and honest failure states; complete outbound MIME persistence first.
- **Tests needed:** Byte-identical raw inbound/outbound retrieval, authorization, unavailable object and MIME attachment/header integrity.

### F35 — HIGH — Profile/security settings are demo/local-only UI

- **Status:** CONFIRMED — source.
- **Problem:** `/settings` renders default demo identity/address components. Profile/address edits only update React state. Security toggles and password dialogs call optional callbacks that the page never supplies. Logout-all and delete-account callbacks are also absent. Existing `user.*` settings/security RPCs are not connected here.
- **Impact:** Users see the wrong identity, lose changes on reload and may believe they changed their password or MFA when no security change occurred. Account/device recovery controls do nothing.
- **Exact file/function:** `apps/web/src/app/(mail)/settings/page.tsx`, `Profile`; `components/main/profile/personal-information/{data.ts,index.tsx,edit-dialog/index.tsx}`; `security/index.tsx:25`/`:30`; `danger/index.tsx:16`; address components.
- **Root cause:** Reused demo components were mounted without real account data and persistence handlers.
- **Evidence:** Default identity is a template user; onSave is a state setter; page supplies no onPasswordChange/onTwoFactorChange/onLogout/onDelete. Password modal closes immediately through its local submit callback.
- **Recommended fix:** Fetch actual user settings/security status and wire explicit validated mutations with success/error states; implement or remove unavailable danger actions.
- **Tests needed:** Verify actual account identity, profile/password/MFA persistence after reload, wrong current password, failed RPC behavior and real logout-all/delete semantics.

### F36 — HIGH — User administration reports successful edits/password resets without saving

- **Status:** CONFIRMED — source.
- **Problem:** User detail `handleSave` changes local state and shows “saved”; `handleResetPassword` shows a success string with the entered password. Neither invokes persistence. New-user quota UI is also not included in the create RPC/service contract.
- **Impact:** Administrators believe role, quota, MFA enforcement or credentials changed while the account remains unchanged; access and recovery decisions are unreliable.
- **Exact file/function:** `apps/web/src/app/(admin)/users/[id]/Component.tsx:49`, `handleSave`; `:72`, `handleResetPassword`; `/users/new/page.tsx`, `handleCreate`; admin userCreate schema.
- **Root cause:** Mock handlers remain behind production-looking controls; required admin update/reset operations are absent.
- **Evidence:** These handlers contain only state setters/timeouts; imported rpcCall is unused in the detail component.
- **Recommended fix:** Implement authorized admin update/reset/quota operations with current-state confirmation, or make unavailable controls explicit until supported.
- **Tests needed:** Save/reset then reload and authenticate with old/new credentials; role enforcement, quota persistence, failure feedback and temporary-credential onboarding.

### F37 — HIGH — Cookie/localStorage session divergence breaks onboarding and account switching

- **Status:** CONFIRMED — source.
- **Problem:** Onboarding stores tokens only in localStorage, while route middleware requires an authorization cookie. `switchAccount` changes localStorage but leaves the old cookie, so server checks and client RPCs can use different users. Middleware treats any nonempty cookie as authenticated and redirects `/login` to `/inbox`; rpcCall does not recognize the actual “Invalid or expired session token” message in its cleanup predicates. Refresh tokens are issued/stored but no refresh endpoint/client workflow exists.
- **Impact:** First onboarding redirects back to login, account switching can mix authorization contexts, and stale-cookie sessions can loop or become stuck. Sessions cannot recover through the advertised refresh-token mechanism.
- **Exact file/function:** Onboarding security page `handleComplete` at :79; `apps/web/src/middleware.ts`, `middleware`; `lib/account-store.ts`, `switchAccount`; `server/middleware/checkAuth.ts`; `lib/api.ts`, rpcCall catch; login `syncAuthSession`.
- **Root cause:** Several independent token stores/lifetimes are updated by different flows without a shared session operation or reliable server validation/refresh lifecycle.
- **Evidence:** Login writes both stores; onboarding/switch write only localStorage. Cookie is seven days; access token can be 30 days. Error string from middleware is absent from cleanup matches.
- **Recommended fix:** Centralize session creation/switch/logout/refresh with one authoritative server-managed session and consistent cookie handling; handle invalid-cookie recovery without unconditional login redirects.
- **Tests needed:** First onboarding into protected route, two-account switching across client/server pages, expired/invalid cookie, expired access token, refresh/revocation and signout of one/all accounts.

### F38 — MEDIUM — Default local development does not start a usable backend

- **Status:** CONFIRMED — source/configuration.
- **Problem:** Web API/rewrites default to localhost:4001 in development while env API_PORT defaults/example use 4000. Backend/shared-package `dev` scripts only run TypeScript watchers; root `pnpm dev` never starts SMTP/API/queue processes.
- **Impact:** The standard dev command can show the UI with unavailable RPC/mail delivery unless developers supply undocumented separate start commands/overrides.
- **Exact file/function:** `apps/web/src/lib/api.ts`, API_BASE_URL; `apps/web/next.config.ts`, rewrites; `packages/env/src/index.ts`, envSchema; app/root package scripts.
- **Root cause:** Build/watch tasks and runtime orchestration are conflated, and endpoint defaults disagree.
- **Evidence:** `dev:"tsc -b -w"` for API/SMTP/queue; API 4000 versus web 4001.
- **Recommended fix:** Align defaults and document/implement a supervised local runtime workflow with clear prerequisites and process readiness.
- **Tests needed:** Clean documented startup, all listeners running, browser RPC via rewrite, inbound local fixture delivery and worker polling without manual hidden overrides.

### F39 — MEDIUM — Contacts favorites/pagination/detail fetching use incompatible parameters

- **Status:** CONFIRMED — source.
- **Problem:** Contacts UI sends `isFavorite` and `page`; backend accepts `favoriteOnly` and `skip`. Detail page retrieves only the first 100 contacts and searches locally despite a service get-by-ID method.
- **Impact:** Favorites filter does not filter, pages repeat the first slice, and valid contacts outside the first 100 appear missing/redirect to the list.
- **Exact file/function:** `apps/web/src/app/(mail)/contacts/page.tsx:96`, `loadContacts`; `/contacts/[id]/page.tsx`, effect; `functions/contacts/list/constants.ts`; `ContactService.listContacts/getContactById`.
- **Root cause:** Pagination/filter contract divergence and missing detail RPC integration.
- **Evidence:** Exact input field mismatches; detail request `{limit:100}` with `.find` in the browser.
- **Recommended fix:** Use the actual filter/offset contract or add a shared page-based one; expose authorized direct contact lookup.
- **Tests needed:** More than 100 contacts, favorite/nonfavorite sets, multiple pages, direct link to a later contact and foreign contact lookup rejection.

### F40 — HIGH — Calendar displays fake/potentially unsaved data and rewrites event times

- **Status:** CONFIRMED — source.
- **Problem:** Calendar initializes three demo events, keeps them on an empty successful response, and converts failed saves/deletes into local-looking changes. Loaded event times are truncated to dates; saves always write 09:00–10:00 UTC, omit allDay/timezone and do not preserve loaded location/description in `handleEventClick`. Fetch range is fixed to now−90/now+180 days and is not refreshed for the visible calendar range.
- **Impact:** Users can believe failed writes succeeded, see fake or deleted events, miss events outside the fixed range and overwrite actual time/timezone/detail information by editing.
- **Exact file/function:** `components/main/calendar/index.tsx:36`, INITIAL_EVENTS; `:109`, handleEventClick; `:132`, fetchCalendarEvents; `:166`, handleSaveEvent; `:228`, handleDeleteEvent; `datesSet` at :562.
- **Root cause:** Demo/offline fallbacks and date-only form mapping replace authoritative persisted state rather than surfacing failures and preserving full event data.
- **Evidence:** `if(res.items.length>0)` prevents clearing; catch blocks mutate local events; explicit T09:00Z/T10:00Z writes; datesSet updates view controls only.
- **Recommended fix:** Remove demo fallback from live accounts, show recoverable errors, preserve timestamps/all-day/timezone/metadata and fetch the visible range.
- **Tests needed:** Empty calendar, last-event deletion, rejected mutation, edit of timed/all-day/timezone events, location/description preservation and navigation beyond six months.

### F41 — MEDIUM — Calendar partial updates can persist an end before the start

- **Status:** CONFIRMED — offline check.
- **Problem:** `updateEvent` compares dates only when both startTime and endTime are supplied in the patch. It does not validate the merged persisted interval. Date/attendee fields are plain strings with weak runtime constraints and updates omit `runValidators`.
- **Impact:** A supported single-field patch can create an inverted interval or invalid calendar state, affecting range queries and rendering.
- **Exact file/function:** `packages/service/src/services/CalendarService.ts:78`, `updateEvent`; `functions/calendar/{list,create,update}/constants.ts`.
- **Root cause:** Validation checks only incoming fields, not the resulting entity.
- **Evidence:** Offline fixture moved only endTime before an existing startTime and the service returned the invalid interval.
- **Recommended fix:** Load/validate the resulting interval with concurrency control, validate timestamps/timezones/attendee states, and enable appropriate update validators.
- **Tests needed:** Start-only/end-only updates across existing bounds, malformed ISO dates, timezone identifiers, invalid RSVP values and concurrent edits.

### F42 — HIGH — Tenant administration reads one organization but writes another

- **Status:** CONFIRMED — source.
- **Problem:** `/org/[slug]/admin` read handlers resolve slug for platform admins, but domain/user/storage/branding write handlers use `authUser.organizationId` and do not resolve the supplied slug. Templates/keys omit slug entirely. Sidebar tenant navigation is hardcoded to `/org/cellsweb/admin`.
- **Impact:** A platform admin viewing tenant B can change their own tenant A instead, create inconsistent domain/user references, or see unrelated keys/templates. Other tenants are routed to the primary tenant's page by the sidebar.
- **Exact file/function:** `OrgAdminClient.tsx:233`, loadData and save/create handlers; `functions/admin/{domainAdd,userCreate,storageUpdate,branding-update}/run.ts`; `layout/app-layout/sidebar/data.tsx`, supportItems.
- **Root cause:** Display target and mutation authorization target are independently inferred rather than sharing a validated tenant context.
- **Evidence:** Client sends `{slug,...}`; write schemas lack slug and run methods always use auth organization; policyUpdate is an exception that does resolve slug correctly.
- **Recommended fix:** Define one explicit authorized target-organization contract per operation and use it consistently in UI/data reads/writes/navigation; preserve platform mailbox privacy rules.
- **Tests needed:** Platform admin from A manages B without touching A; org admin cannot target B; keys/templates/created users/storage target the viewed tenant; sidebar uses logged-in tenant slug.

### F43 — MEDIUM — Domain verification does not verify the claimed DNS state

- **Status:** CONFIRMED — source; no DNS queries were run.
- **Problem:** Verification marks any MX record as VERIFIED, accepts any DKIM TXT containing v=DKIM1 without matching the generated key, never evaluates SPF/DMARC and never clears isVerified when the ownership token disappears. DomainVerify also lacks organization scoping.
- **Impact:** DNS indicators can claim readiness for the wrong mail server/key; verification state becomes stale, and another authenticated user can trigger changes/checks to a foreign domain. SPF/DMARC can remain pending forever.
- **Exact file/function:** `packages/service/src/services/DomainService.ts:45`, `verifyDomain`; `apps/api-server/src/functions/admin/domainVerify/run.ts`, run.
- **Root cause:** Record existence/substring checks substitute for semantic ownership/routing/key validation; requested domain is looked up globally.
- **Evidence:** `mxRecords.length>0`; `dkimTxt.includes("v=DKIM1")`; isVerified is only assigned true; no SPF/DMARC calls or organization predicate.
- **Recommended fix:** Scope domain access and separately validate ownership, expected MX destination, exact DKIM key/selector, SPF and DMARC with explicit failure/temporary states.
- **Tests needed:** Stubbed DNS fixtures for wrong MX/key, split TXT chunks, missing/removed ownership token, temporary DNS errors, SPF/DMARC and foreign-tenant IDs.

### F44 — MEDIUM — DNS onboarding instructions omit the required ownership proof and hardcode another deployment

- **Status:** CONFIRMED — source.
- **Problem:** Verification requires `verificationToken`, but onboarding dnsRecords and domain-detail DNS/BIND output omit it. Generated MX/webmail targets and SPF include use cellsweb.com rather than the configured installation. Domain selector UI is editable but not sent to addDomain. Generated DKIM BIND TXT is emitted as one long quoted string.
- **Impact:** Following UI instructions alone cannot verify a new domain; a self-hosted deployment can route mail/webmail to the wrong host. DNS import compatibility is not assured for the unchunked long TXT value.
- **Exact file/function:** `OrganizationService.ts:66`, onboardOrganization dnsRecords; `apps/web/src/app/(admin)/domains/[id]/Component.tsx:43`, DNS constants/generateBindZoneContent; `/domains/new/page.tsx`, handleCreateDomain; `DomainService.addDomain`.
- **Root cause:** Installation-specific sample DNS data was shipped as dynamic onboarding instructions; backend-required proof is not exposed in that workflow.
- **Evidence:** No verificationToken/ci-verify entry in the rendered DNS instructions; hardcoded mail.cellsweb.com/webmail.cellsweb.com/_spf.cellsweb.com; selector always saved as ci.
- **Recommended fix:** Generate all required proof/routing records from validated installation configuration and returned domain metadata; support or remove selector input and emit valid chunked TXT zone data.
- **Tests needed:** New non-cellsweb installation follows only displayed instructions to verification; zone parser/import validation, token visibility, selector behavior and expected MX/CNAME targets.

### F45 — MEDIUM — Registration's “Test Storage” never contacts or validates storage

- **Status:** CONFIRMED — source.
- **Problem:** `handleTestStorage` constructs an unused config, checks a subset of fields and reports success with a fixed 38 ms latency. `onboardOrganization` saves storage settings without calling `StorageService.testConnection`; that test itself only heads the bucket and does not establish write/read/delete permission.
- **Impact:** Invalid or insufficient credentials are accepted as working, and first mail can fail after the tenant is activated. UI results overstate verification.
- **Exact file/function:** `apps/web/src/app/(auth)/onboarding/organization/page.tsx:92`, handleTestStorage; `OrganizationService.onboardOrganization`; `StorageService.ts:29`, testConnection.
- **Root cause:** Client-side form validation is presented as a connection test and is not followed by server-side capability validation.
- **Evidence:** Literal success message/latency; no RPC/fetch in handleTestStorage; onboarding does not invoke any storage test.
- **Recommended fix:** Distinguish local validation from real server-side connectivity/capability checks; require verified storage before activation and clean up any test objects.
- **Tests needed:** Invalid credentials, nonexistent/read-only bucket, missing Put/Get permission and provider errors using isolated fixtures/mocks; UI must not show fabricated latency/success.

### F46 — MEDIUM — Root layout branding uses a nonexistent REST-style RPC URL

- **Status:** CONFIRMED — source and installed RPC handler inspection.
- **Problem:** RootLayout POSTs `{host}` to `/api/rpc/auth/branding` instead of the `/rpc` endpoint with `{namespace,functionName,data}`. CoreRPC is configured to accept only `/rpc` (and its trailing slash), and no such REST route exists.
- **Impact:** Server-side tenant theme/favicon lookup silently falls back, although login-page branding via rpcCall can work. Claimed white-label behavior is inconsistent across pages.
- **Exact file/function:** `apps/web/src/app/layout.tsx`, RootLayout branding fetch; `apps/api-server/src/index.ts`, CoreRPC config; installed `@cellsweb/rpc-core/dist/core-rpc.js:197`, createHandler.
- **Root cause:** A REST URL pattern is assumed for a single-endpoint RPC server.
- **Evidence:** Handler matches POST pathname===rpcPath; layout constructs an unmatched nested path. Rewrite `/api/:path*` does not turn that into a valid RPC envelope.
- **Recommended fix:** Use the same typed RPC client/envelope internally with installation-correct host resolution; surface/log errors appropriately.
- **Tests needed:** Custom tenant host produces server-rendered theme/favicon across authenticated pages, default host fallback and unavailable API behavior.

### F47 — MEDIUM — Health and delivery indicators are hardcoded

- **Status:** CONFIRMED — source.
- **Problem:** Tenant overview returns isPrimaryPort25Active=true and platform overview returns isPort25Active=true without reading SMTP process/queue state. Public health returns static ok/time/version rather than dependency readiness. Campaign send reports SENT when mail is merely queued.
- **Impact:** Administrators can see healthy delivery and successful campaigns while SMTP/worker/storage is unavailable or downstream delivery later fails.
- **Exact file/function:** `functions/admin/overview/run.ts`, run; `functions/platform/overview/run.ts`, run; `functions/public/health/run.ts`; `TemplateService.sendTemplateBatch` result mapping.
- **Root cause:** UI status fields are not connected to measured runtime state or asynchronous delivery outcomes.
- **Evidence:** Literal true/ok; template code increments sent after `MailService.sendMail`, whose outbound result is queued.
- **Recommended fix:** Separate liveness/readiness and accepted/queued/delivered/failed states; derive health from actual service heartbeats/dependencies and expose per-recipient delivery status.
- **Tests needed:** Stop worker/SMTP in an isolated environment, dependency failure and queued→delivered/bounced transitions; indicators must change accurately.

### F48 — HIGH — Docker build copies local secrets, dependencies and storage into runtime images

- **Status:** CONFIRMED — source/configuration; image build not performed.
- **Problem:** There is no `.dockerignore`. Builder runs `COPY . .`, and runtime targets copy all of `/app`. Local `.env` files, `.git`, host node_modules, storage/temp data and build artifacts enter the build context and potentially the final image. Host dependencies can overwrite the Alpine install. Production JWT settings also have known fallback values rather than required secrets.
- **Impact:** Images can contain credentials/mail data/history and platform-incompatible native dependencies; behavior depends on the developer checkout. Missing secret configuration silently uses repository-known signing keys.
- **Exact file/function:** `Dockerfile:26`, builder COPY; runtime COPY at :36/:46/:56/:65; absent `.dockerignore`; `docker-compose.yml:64`, JWT defaults; envSchema JWT defaults.
- **Root cause:** Build context and runtime artifact boundaries are unrestricted; production configuration fails open to development constants.
- **Evidence:** `.env`, node_modules and storage/temp exist in the repository directory; Docker copies the complete directory and then the complete builder tree. No values from local secret files were inspected or included here.
- **Recommended fix:** Explicitly exclude secrets/data/host artifacts, copy only required runtime outputs/dependencies and require per-install secrets at runtime; test clean, reproducible image construction.
- **Tests needed:** Inspect a locally built fixture image/context for forbidden files, build with/without host node_modules, verify native-module loading and reject unset/default production secrets.

### F49 — MEDIUM — Documented TLS/proxy deployment does not match Compose

- **Status:** CONFIRMED — source/configuration; live handshake/deployment UNVERIFIED.
- **Problem:** TLS guide/environment example use `/etc/letsencrypt`, while Compose mounts only `/etc/dokploy/shared-certs`. The guide's host Nginx points at localhost:3000/4000, but Compose publishes neither port and requires an existing external dokploy-network. Global SMTP fallback env settings and bootstrap/API-doc settings are not fully passed through to services. SMTP startup quietly proceeds when configured certificate files are missing.
- **Impact:** Following the documented generic deployment can yield unavailable HTTP upstreams, missing STARTTLS certificates or unavailable fallback delivery despite apparently configured environment files.
- **Exact file/function:** `docker-compose.yml` service environment/volumes/networks; `docs/TLS-LIFECYCLE.md:80`; `docs/PRODUCTION-DEPLOYMENT.md:110`; `apps/server/src/index.ts`, bootstrap.
- **Root cause:** Generic Nginx/Certbot instructions and Dokploy-specific wiring have diverged; environment substitution is mistaken for automatic container environment injection.
- **Evidence:** Only SMTP 25 is published; no LetsEncrypt mount/env_file; env file example relay-related variables are not automatically inherited by queue worker. Missing key/cert branches only skip loading.
- **Recommended fix:** Provide complete consistent deployment profiles, explicit env mappings and certificate prerequisites/readiness; verify actual behavior before claiming zero-downtime TLS lifecycle completion.
- **Tests needed:** Compose static validation plus isolated generic/Dokploy deployment fixtures, upstream reachability, certificate absence/rotation/replacement and relay configuration propagation.

### F50 — MEDIUM — Tests are not wired into the workspace and some can falsely pass

- **Status:** CONFIRMED — source/manifest inspection.
- **Problem:** Root test delegates to Turbo but no workspace defines a test script. Existing tests connect to configured/default cellsinbox DB and write/delete data; they are not safe isolated CI fixtures. SMTP negative tests catch the deliberately thrown “accepted unexpectedly” error and print rejection success anyway. DKIM test checks header presence/selector/domain, not cryptographic validity; SES test saves mock configuration without testing delivery.
- **Impact:** A test command cannot establish regression coverage; historical “100% pass” claims overstate validation and can miss boundary/integration failures. Running scripts unmodified risks existing data/pollution.
- **Exact file/function:** Root/workspace package.json scripts; `apps/server/test/inbound_smtp.test.ts`, runTest anti-relay/unknown-user try/catch blocks; `packages/service/test/mta_outbound_delivery.test.ts`, DKIM assertions; `api_key_and_admin_flow.test.ts`, SES config check; `docs/LAST-ACTIONS.md:52`.
- **Root cause:** Ad hoc executable scripts and optimistic logging are treated as an automated, isolated end-to-end test suite.
- **Evidence:** No test script in eight packages; caught self-thrown errors; tests omit real RPC registry/browser/cross-process boundaries. Existing scripts were inspected but not executed in this audit.
- **Recommended fix:** Wire deterministic isolated test runners, make negative assertions fail correctly, verify cryptographic output, and distinguish configuration/unit checks from real transport/end-to-end evidence.
- **Tests needed:** Introduce a controlled intentionally failing case to prove CI fails; isolated DB naming/cleanup, RPC/browser/process-boundary tests and captured local DKIM signature verification.

### F51 — MEDIUM — Lint command fails because no lint configuration exists

- **Status:** CONFIRMED — command exit 1.
- **Problem:** Web `lint` invokes next lint, which opens ESLint initialization instead of checking files. ESLint/config dependencies are not established, and other workspaces have no lint scripts.
- **Impact:** The repository has no functioning repeatable lint gate; build output saying “Linting and checking validity of types” is not evidence that lint rules ran.
- **Exact file/function:** `apps/web/package.json`, scripts.lint; missing ESLint configuration/dependencies; root scripts.lint.
- **Root cause:** Template lint script exists without tooling setup.
- **Evidence:** `CI=1 NEXT_TELEMETRY_DISABLED=1 pnpm --filter @cellsinbox/web lint < /dev/null` exited 1 and asked how to configure ESLint.
- **Recommended fix:** Configure a noninteractive lint CLI/ruleset and CI task aligned with installed Next/TypeScript versions.
- **Tests needed:** Lint succeeds on a clean fixture and fails noninteractively for a deliberate rule violation across intended packages.

### F52 — MEDIUM — Seed scripts are excluded from checks and have compile/runtime schema drift

- **Status:** CONFIRMED — compiler/source; scripts were not executed.
- **Problem:** Backend tsconfigs include only src. Adding service scripts to the same compiler check finds 34 diagnostics, all in `packages/service/scripts/seed_admin.ts`, including nonexistent preference defaultToHtml. Root `scripts/seed_admin.ts` uses obsolete Message/body/calendar fields and omits required message/contact fields; it also resets an existing admin password to a literal development password.
- **Impact:** Standard builds conceal broken installation/demo tooling; running the root script can alter credentials before failing partway through seeding.
- **Exact file/function:** `packages/service/scripts/seed_admin.ts`, seed (:11, :30, :50, :59 and nullability diagnostics); `scripts/seed_admin.ts`, seed; package tsconfig include lists.
- **Root cause:** Duplicate bootstrap scripts are outside validated source and have diverged from current schemas.
- **Evidence:** Separate no-emit compiler run: 34 service-script diagnostics; service/server test sources themselves had zero diagnostics. Root script constructs sender/recipients/messageIdHeader/s3RawMimeKey instead of required from/messageId/s3RawKey and contacts without organizationId.
- **Recommended fix:** Consolidate explicit seed/install tooling, typecheck it, use current schemas, separate demo and production modes, and never reset existing passwords implicitly.
- **Tests needed:** Dry-run/isolated clean and repeated seeding, schema validation, existing-user credential preservation, rollback and compilation of all support scripts.

### F53 — MEDIUM — Claimed/planned product workflows have no implementation

- **Status:** CONFIRMED — repository inventory; this finding distinguishes stated goals from completion claims.
- **Problem:** No draft save/restore/autosave route, CalDAV/CardDAV/Sieve implementation, invitation transport/RSVP RPC, recurrence expansion, queue monitor/retry UI, certificate monitor or org-admin mailbox-compliance view exists. Contact search and calendar RSVP helpers exist but are not connected to complete user workflows. Global header search prevents submit; notifications are demo records; locale API is a hardcoded English mock.
- **Impact:** A user cannot complete these described workflows; settings and documents imply capability beyond what is shipped. Inactive template/demo files should not be counted as completed product features.
- **Exact file/function:** `docs/{GOALS,ARCHITECTURE,UI-INSTRUCTIONS,COMPONENTS-LIST,LAST-ACTIONS}.md`; RPC/app route inventory; `CalendarService.respondToInvite`; `ContactService.searchAutocomplete`; `layout/app-layout/header/index.tsx`; `layout/header/notification-dropdown/data.ts`; `lib/next-intl-mock.ts`.
- **Root cause:** Schemas/helpers/templates and design goals are conflated with delivered end-to-end features.
- **Evidence:** DRAFTS enum/count without write route; no named protocol servers/routes; active composer has no contacts.search call; RSVP helper has no RPC; notification/search data/handlers are static.
- **Recommended fix:** Correct completion claims and explicitly track each missing workflow; expose only supported controls and wire implemented helpers through authorized APIs/UI when completing them.
- **Tests needed:** Acceptance tests for every advertised workflow from UI/protocol entry point through persistence and reload; missing goals must remain visibly marked planned until these pass.

### F54 — MEDIUM — Input validation and search queries allow invalid states and expensive unscoped work

- **Status:** CONFIRMED — source.
- **Problem:** Mail recipient schemas permit empty arrays/arbitrary strings; folder update accepts arbitrary strings and uses findOneAndUpdate without runValidators. Contacts pagination/regex inputs are unbounded. Mail search interpolates raw regex and scans MessageModel globally before restricting results through user mailbox states; contact search similarly uses raw regex.
- **Impact:** Empty/malformed sends can create SENT records without real delivery, invalid folders can hide messages, malformed regex can fail a normal search, and one user's search can perform work across every tenant. This is a correctness/resource-isolation concern, not a measured load-test claim.
- **Exact file/function:** `functions/mail/{send,update-state,list}/constants.ts`; `MailService.ts:243`, listUserMailbox search; `:438`, updateMailboxState; `ContactService.listContacts/searchAutocomplete`; contact list schema.
- **Root cause:** Shared enum/email constraints are not used at RPC boundaries; query updates bypass model validation; user search is treated as trusted regex.
- **Evidence:** `Type.Array(Type.String())` with no minItems/email format; folder Type.String; raw `$regex:term`; no organization filter on matchingMessages; absent runValidators.
- **Recommended fix:** Validate bounded canonical recipients/enums/IDs/pagination, escape literal search terms or define a constrained search language, and scope indexed searches to authorized tenant/mailbox data before execution.
- **Tests needed:** Empty/invalid recipients, unknown folders, malformed regex characters, negative/fractional/huge pagination, whitespace names and multi-tenant query scoping; no live stress testing required.

### F55 — MEDIUM — Startup's legacy-index migration targets the wrong collection

- **Status:** CONFIRMED — offline model inspection and source; existing deployment indexes UNVERIFIED.
- **Problem:** connectToDatabase accesses collection mailbox_states to drop the old user/message index, but Mongoose's MailboxState model uses its default collection name mailboxstates.
- **Impact:** The intended migration does not remove a legacy index on the actual collection; upgraded installations may retain the old uniqueness rule and fail self-delivery. Errors are swallowed, so operators cannot distinguish success from no-op/failure.
- **Exact file/function:** `packages/db/src/connection.ts:32`, connectToDatabase migration; `packages/db/src/models/MailboxState.ts`, model definition.
- **Root cause:** A documented collection name is used instead of the model's actual configured collection; there is no versioned migration verification.
- **Evidence:** Offline inspection of `MailboxStateModel.collection.name` returned `mailboxstates`; model declares no collection override.
- **Recommended fix:** Use explicit stable collection names and versioned, idempotent migrations with verifiable outcomes; do not perform an unlogged best-effort schema migration on every worker connection.
- **Tests needed:** Isolated legacy/current collection indexes, concurrent startup, migration failure, self-send after upgrade and no mutation of unrelated collections.

### F56 — MEDIUM — Deletion and quota policies do not maintain storage lifecycle/accounting

- **Status:** CONFIRMED — source.
- **Problem:** Permanent delete removes only a mailbox state and always reports true, with no last-reference cleanup of message/body/attachments/blobs. There is no blob deletion method/reconciler. storageUsedBytes is never incremented/decremented by mail paths, and user/org storage, file-count/file-size, maxUsers/maxDomains and default-user-quota settings are not enforced by the corresponding services.
- **Impact:** Quota meters remain inaccurate, tenants can exceed configured limits, and “permanently deleted” mail can remain indefinitely in the database/storage. Referenced shared messages require careful retention semantics rather than unconditional deletion.
- **Exact file/function:** `MailService.ts:488`, deleteMessage; ingestion/send methods; `ApiKeyService.sendProgrammaticEmail`; `UserService.createUser`; `DomainService.addDomain`; `OrganizationService.updatePolicyConfig`; `StorageService` API.
- **Root cause:** Policy/configuration fields and mailbox visibility changes were implemented without transactional accounting, retention or object garbage collection.
- **Evidence:** Search of service write paths finds no storageUsedBytes update or quota decision; permanent branch deletes only MailboxStateModel; SDK wrapper exposes no DeleteObject operation.
- **Recommended fix:** Define shared-reference retention and actual purge semantics, implement idempotent cleanup/reconciliation, and reserve/release quotas atomically across every intake/send/provisioning path.
- **Tests needed:** Last/non-last reader deletion, nonexistent delete, purge failure/retry, orphan reconciliation, concurrent quota reservations, exact size/count limits and quota release after deletion.

### F57 — MEDIUM — WebSocket cleanup reconnects after unmount and retains old user registrations

- **Status:** CONFIRMED — source.
- **Problem:** Hook cleanup closes the socket, but its onclose handler always schedules a reconnect while any access token remains. The timeout is not tracked/cancelled and no disposed flag prevents reconnection after unmount. Server registerSocket can associate the same socket with a new user without removing its previous user set; close only cleans the latest currentUserId.
- **Impact:** Navigating away can leave background sockets/reconnect loops and duplicate notifications after remount. Account reauthentication leaves stale registrations and retained closed sockets in prior user sets, beyond the session-expiry concerns in F05.
- **Exact file/function:** `apps/web/src/lib/useMailSocket.ts`, connect/onclose/useEffect cleanup; `apps/api-server/src/index.ts`, registerSocket/close/error handlers.
- **Root cause:** Connection lifetime and authenticated registration are not modeled as replaceable, cancellable resources.
- **Evidence:** Cleanup calls `.close()`; onclose's timeout checks only localStorage token. registerSocket overwrites currentUserId and adds the socket to another set without unregistering the old association.
- **Recommended fix:** Track disposal/reconnect timers, cancel them on cleanup, and atomically replace socket identity with cleanup of all previous registrations; add bounded reconnect/backoff behavior.
- **Tests needed:** Fake-timer hook mount/unmount/remount, navigation while authenticated, reconnect during cleanup and socket reauthentication from fixture user A to B followed by close.

### F58 — MEDIUM — Local attachment download returns an unusable server file URL

- **Status:** CONFIRMED — source; real browser behavior was not exercised.
- **Problem:** Local getAttachmentSignedUrl returns file:// plus the server's absolute filesystem path. The detail UI opens downloadUrl directly. That URL names a file on the user's machine/browser context, not an authenticated HTTP resource. The existing attachment-content RPC is not invoked; the detail mapping also drops attachment IDs needed for it. The catch fallback `/api/attachment/:id` has no implemented handler either.
- **Impact:** Even a single-process local fallback installation cannot provide reliable browser downloads from these URLs; it exposes server filesystem layout and masks an unfinished download workflow.
- **Exact file/function:** `packages/service/src/services/StorageService.ts:100`, getAttachmentSignedUrl; `MailService.ts:392`, attachmentList mapping; `apps/web/src/app/(mail)/inbox/[id]/page.tsx`, attachment response mapping; detail Component.tsx:81, handleDownloadAttachment.
- **Root cause:** A local server path is treated as a public download capability; transport-specific download handling is not integrated end to end.
- **Evidence:** Literal file:// return; window.open on that URL; no attachment-content RPC call in the active detail UI and no HTTP attachment route in the server inventory.
- **Recommended fix:** Serve local objects through an authorized HTTP/content endpoint or wire the existing content RPC with attachment IDs and correct ownership checks (F09); keep S3 signed URLs as a separate supported transport.
- **Tests needed:** Local/S3 download from a separate browser host, binary integrity, filename/content type, expired signed URL, unauthorized attachment and missing local file.

## Verification record and limits

| Check | Result | Interpretation |
|---|---|---|
| Initial git status and source revision | Clean; revision above | No pre-existing changes were included in findings |
| Fresh TypeScript compiler API pass over all eight source projects | Exit 0, zero diagnostics | Dependencies emitted to an in-memory map and consumed by subsequent projects; no repository dist/tsbuildinfo writes |
| Isolated Next.js build | Exit 0; Next 15.5.29 | Source snapshot under `/private/tmp/cellsinbox-audit-snapshot`; installed dependencies reused, all networking/fetch denied and Google Fonts locally mocked; not a clean Docker/frozen-install test |
| Web lint command | Exit 1 | ESLint initialization prompt, no working lint configuration |
| Test/support-script typecheck | Service seed script: 34 diagnostics; service/server test sources: 0 | Additional check includes files omitted from normal src-only configurations; did not execute scripts |
| Offline behavior harness | Exit 0; 11 defect checks and 3 positive controls established expected observations | Original source transpiled in memory; DB/storage/SMTP stubbed; no real application infrastructure |
| RPC call AST inventory | Five unresolved call sites | mail.updateState twice, mail.delete twice, mail.getRaw once; registration semantics independently inspected |
| Mongoose collection-name inspection | mailboxstates | Constructed model only; no database connection |
| Fallow 2.87.0 static inventory | 2,213 candidates: 1,120 unused files, 1,079 exports, 14 dependencies | Screening only. Filesystem-discovered RPC modules are false positives; these counts are not 2,213 verified defects and no deletion is recommended from this output alone |

Offline defect checks established: production env proxy/false coercion; onboarding without a factor; foreign-parent attachment lookup; skipped suspension check; mailbox-user admin creation; duplicate unclaimed batches; outbound header/attachment loss; acceptance of sizeExceeded stream; inverted partial calendar update; path traversal resolution; and unresolved client RPC names. Positive controls verified JWT signature handling, template interpolation and contact ownership predicates.

The harness and machine-readable compiler/behavior/RPC/static-analysis evidence were kept in `/private/tmp/cellsinbox-audit-checks.cjs`, `/private/tmp/cellsinbox-typescript-audit.json`, `/private/tmp/cellsinbox-behavior-results.json`, `/private/tmp/cellsinbox-rpc-mismatches.json` and `/private/tmp/cellsinbox-fallow-audit.json`. They are ephemeral review evidence, not application tests or committed artifacts. Relevant observations are recorded in the findings so the report does not depend on those files surviving.

Not established: actual MongoDB indexes/data state, external deliverability/reputation, DNS correctness for any real domain, S3/SES credentials or behavior, TLS handshake/renewal, browser WebAuthn ceremonies, cross-process live mail delivery, production infrastructure, image startup or backup restoration. No assertion about third-party vulnerabilities/CVEs is made. Historical Gemini-authored status/logging was treated as a claim to compare with code, never as verification evidence.

The only intended repository change from this audit is `docs/CODEX_AUDIT_REPORT.md`. No fixes were implemented.


## Remediation Tracking

| Finding | Severity | Category | Status | Verified By | Implementation & Verification Summary |
|---|---|---|---|---|---|
| **F11** | HIGH | Security / Auth | **FIXED — VERIFIED** | Gemini | Replaced external `api.qrserver.com` URL with local offline `qrcode` canvas/data-URL generation in `apps/web/src/app/(auth)/onboarding/security/page.tsx`. Zero network requests or secret leakage. Verified with `next build`. |
| **F15** | HIGH | Runtime / Env | **FIXED — VERIFIED** | Gemini | Fixed `isBuildTime` in `packages/env/src/index.ts` to strictly check `process.env.NEXT_PHASE === "phase-production-build"`. Implemented `booleanEnv` to safely parse string boolean flags ("false", "0"). Added automated regression test suite (`packages/env/test/env.test.ts`) passing all 4 unit assertions. |
| **F48** | HIGH | Infrastructure / Build | **FIXED — VERIFIED** | Gemini | Added `.dockerignore` excluding `.env*`, `.git`, host `node_modules`, local storage blobs, and build artifacts from Docker build context, preventing secret leaks and host platform dependency collisions. |
| **F03** | CRITICAL | Security / Rendering | **FIXED — VERIFIED** | Gemini | Implemented DOMPurify HTML sanitization with an email-safe allowlist and forced `target="_blank"` with `rel="noopener noreferrer nofollow"` to prevent tabnabbing. Isolated rendering in an opaque sandboxed `<iframe>` (`sandbox="allow-popups allow-popups-to-escape-sandbox"` without `allow-scripts` or `allow-same-origin`) with restrictive Content Security Policy meta header and viewport container scroll containment. Default remote images and external styles are blocked with an explicit user action to load them. Verified with automated regression suite `apps/web/test/sanitize-email.test.ts` (10 passing tests including real DOM execution rejection in JSDOM) and `next build` static page generation. |
