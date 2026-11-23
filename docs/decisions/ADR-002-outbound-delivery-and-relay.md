# ADR-002: Outbound Delivery Strategy & Relay Architecture

- **Decision Identifier:** ADR-002
- **Topic:** Outbound Delivery MTA & Relay Fallback
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
Sending outbound email to major mailbox providers (Google, Microsoft, Yahoo) requires resolving remote MX records via DNS, establishing TLS connections over port 25, signing messages with DKIM, and maintaining strict IP reputation. We need to define how the outbound MTA dispatches mail.

## Alternatives Considered
- **Option A: Direct-to-MX Only:** Outbound worker resolves destination MX records via `node:dns` and delivers directly over port 25.
- **Option B: Dual-Mode MTA (Direct-to-MX with Upstream Relay / AWS SES Fallback) (Approved):** Direct-to-MX delivery by default, paired with an optional, configurable smart host relay (e.g. AWS SES, SendGrid) per organization or platform-wide.

## Tradeoffs
- *Option A* is completely independent but leaves no alternative if a remote provider greylists or throttles an IP during initial warmup.
- *Option B* maximizes operational reliability. It allows the system to utilize direct MX delivery on the host server where port 25 is unblocked, while providing a seamless failover/relay option via AWS SES if needed.

## Decision & PO Rationale
**Approved Option B.** The PO confirmed: *"my server has them open"*, choosing Option B to allow direct delivery while enabling AWS SES integration as an optional fallback.

## Dependencies
- `node:dns` (MX resolution)
- Direct SMTP transport (`nodemailer` / custom direct transport)
- AWS SES / SMTP Smart Host connector
