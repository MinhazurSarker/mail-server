# CellsInbox: Master Goals & Core Invariants

**Document Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 2026-11-22  

---

## 1. Project Mission

CellsInbox is a sovereign, enterprise-grade, self-hosted email infrastructure and webmail ecosystem built on **Node.js, MongoDB (Mongoose), React / Next.js, and CellsWeb RPC**.

The primary objective is complete infrastructure ownership—eliminating dependency on external suites such as Stalwart, Postfix, or Dovecot—while providing a modern, reliable, and secure mail platform.

---

## 2. Non-Negotiable Core Invariants

1. **Product Owner Authority:**
   - The user is the sole Product Owner. No architectural, infrastructural, or dependency changes may be made without explicit PO approval.
2. **Zero Direct Database Access from Application Layers:**
   - `packages/db` Mongoose models can ONLY be imported and called by `packages/service`.
   - RPC endpoints (`apps/api-server`), SMTP handlers (`apps/server`), queue runners (`apps/queue`), and Next.js server actions (`apps/web`) must invoke service methods.
3. **Bring-Your-Own-Storage (BYOS) Isolation:**
   - Every Organization (tenant) MUST provide S3-compatible credentials (Cloudflare R2, AWS S3, etc.).
   - All email attachments and raw RFC 5322 MIME blobs must be streamed to the organization's S3 bucket.
   - MongoDB stores only parsed, normalized metadata to ensure fast, low-memory database operations.
4. **Strict Platform Privacy Boundary:**
   - Platform Super Admins and Support staff CANNOT inspect, read, or search the subjects, bodies, or attachments of tenant emails.
   - Org Admins have administrative oversight and compliance visibility over their own organization's users' messages.
   - The platform owner must create an Organization and be approved like any other tenant to access mailboxes.
5. **No Public Port 587 SMTP Exposure:**
   - No open SMTP submission on port 587.
   - End-user mail sending is handled via authenticated Webmail RPC calls.
   - Programmatic sending is handled via SendGrid-style scoped API keys (`ci_live_...`) with strict rate limiting.
6. **Mandatory 2-Step Verification Onboarding:**
   - Users created by Org Admins receive temporary credentials.
   - On first login, users MUST configure at least one 2-Step Verification method (WebAuthn Passkey or TOTP) before gaining access.
7. **Dual-Mode Outbound MTA:**
   - Direct-to-MX delivery is the default (host port 25 is unblocked).
   - Outbound delivery supports configurable fallback to AWS SES or Smart Host for delivery resilience.
8. **AI Session Continuity:**
   - Every development session must record its actions and state in `docs/LAST-ACTIONS.md` so subsequent sessions can take over without context loss.

---

## 3. High-Level Success Criteria

- **Functional Inbound:** External emails from Gmail, Outlook, etc. reliably delivered to port 25, validated (SPF/DKIM/DMARC), parsed, offloaded to S3/R2, and recorded in MongoDB.
- **Real-Time Webmail:** Next.js webmail inbox renders emails instantly via WebSockets with zero page refreshes.
- **High Deliverability Outbound:** Outbound queue reliably delivers to external MX servers with valid DKIM signatures and handles retries/bounces cleanly.
- **Enterprise Scope:** Full implementation of contacts, calendar, CalDAV/CardDAV, Sieve filtering rules, and administrative governance.
