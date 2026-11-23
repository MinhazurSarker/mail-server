# ADR-006: Authentication, 2FA Onboarding & SendGrid-Style API Sending

- **Decision Identifier:** ADR-006
- **Topic:** User Authentication, Mandatory 2FA & Outbound API Sending
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
Traditional email systems expose port 587 (SMTP submission with `AUTH LOGIN`/`PLAIN`) to the public internet, leaving them open to automated brute-force attacks and credential stuffing. Furthermore, standard desktop mail clients cannot execute modern WebAuthn/Passkey handshakes over raw SMTP.

## Alternatives Considered
- **Option A: Standard SMTP Port 587 Exposure:** Exposing port 587 with username/password authentication.
- **Option B: WebAuthn + App Passwords for Port 587:** Supporting Passkeys on web and generating dedicated passwords for traditional SMTP submission.
- **Option C: Zero Public Port 587 Exposure + SendGrid-Style API Keys + Mandatory 2FA Onboarding (Approved):** Closing public port 587 entirely. Web users authenticate via RPC with mandatory 2-step setup on first login. Programmatic sending is conducted exclusively via scoped, rate-limited HTTP/RPC API keys.

## Decision & PO Rationale
**Approved Option C.** The PO instructed:
*"for web panel login, when onboarding a user, we make them use atleast one 2 step.. admin creates the user, pass under his organization's one of domains, and when user 1st logs in, he must set those security staffs. and a user can create api key for sending email (with rate limits and if he has api permission)"*
*"no smtp exposures... since it is hackable.. so, api like sendgrid."*

## Security Workflow
1. **User Onboarding:**
   - Org Admin provisions user under one of the organization's verified domains with a temporary password.
   - First Login: User enters credentials and is forced into security onboarding: must enroll at least one 2-Step Verification method (WebAuthn Passkey or TOTP).
   - Account transitions to `ACTIVE` upon 2FA enrollment.
2. **Programmatic Sending:**
   - Users with sending permissions generate cryptographically hashed API keys (e.g. `ci_live_...`).
   - Outbound mail is submitted via authenticated CellsWeb RPC / REST endpoint (`POST /api/v1/mail/send`).
   - Enforces per-key rate limits, allowed sender domains, and IP restrictions.

## Dependencies
- `@simplewebauthn/server` & `@simplewebauthn/browser`
- `otplib` (TOTP generation and verification)
- `argon2` / `bcrypt` (secure password & API key hashing)
