# ADR-001: SMTP Protocol Implementation Strategy

- **Decision Identifier:** ADR-001
- **Topic:** SMTP Protocol & MIME Stream Implementation
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
CellsInbox requires an inbound SMTP engine capable of receiving email from external MTAs (Gmail, Outlook, etc.) on port 25 with STARTTLS, handling SMTP state machines (EHLO, MAIL FROM, RCPT TO, DATA), and processing incoming RFC 5322 MIME messages. We must decide whether to implement the raw TCP socket parsing completely from scratch or leverage audited protocol primitives.

## Alternatives Considered
- **Option A: 100% Native Scratch Implementation:** Hand-writing all RFC 5321 and RFC 5322 parsing directly on `node:net`, `node:tls`, and custom regex/stream parsers.
- **Option B: Layered Hybrid Engine (Approved):** Utilize battle-tested protocol/parser primitives (`smtp-server` for connection lifecycle and STARTTLS; `mailparser` for MIME stream processing) while retaining 100% custom control over mail routing, authentication, multi-tenancy, rate limiting, and storage offloading.
- **Option C: Phased Replacement:** Start with protocol primitives and rewrite in native `node:net` later.

## Tradeoffs
- *Option A* offers total independence but introduces enormous engineering overhead and vulnerability to malformed MIME exploits, nested multipart parser crashes, and character encoding bugs.
- *Option B* achieves enterprise-grade RFC compliance, TLS safety, and rapid stability, while still leaving the entire core mail engine, routing, tenancy, and storage architecture fully proprietary and customized.

## Decision & PO Rationale
**Approved Option B.** The Product Owner confirmed: *"B sounds good, no need to re-invent the wheels... we can't sacrifice the necessary controls we are getting when using raw. B will give us both freedom and protocol."*

## Dependencies
- Node.js native streams & networking (`node:net`, `node:tls`)
- `smtp-server` (protocol lifecycle & STARTTLS)
- `mailparser` (streaming MIME parser)
