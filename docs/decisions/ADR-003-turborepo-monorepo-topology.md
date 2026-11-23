# ADR-003: Turborepo Monorepo Topology & Process Decoupling

- **Decision Identifier:** ADR-003
- **Topic:** Workspace Monorepo Topology & Process Boundaries
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
CellsInbox combines long-running network listeners (SMTP port 25), background queue processors for MTA outbound retries, RPC API servers, WebSockets, and modern Next.js web applications. We must establish a clear code organization and process separation strategy.

## Alternatives Considered
- **Option A: Single-Process Monolith:** All components running in a single Node.js runtime.
- **Option B: Turborepo Monorepo with Decoupled Services & Packages (Approved):** A clean monorepo separating runnables (`apps/`) from shared libraries (`packages/`).

## Architecture Specification
```
CellsInbox/
├── apps/
│   ├── server/         # Inbound SMTP daemon (Port 25, STARTTLS)
│   ├── api-server/     # CellsWeb RPC API server + WebSockets
│   ├── queue/          # MTA outbound delivery engine & async queue worker
│   └── web/            # Next.js web application (Webmail + Admin)
├── packages/
│   ├── db/             # Mongoose connections, models, and indexing
│   ├── schema/         # TypeBox schemas, DTOs, and shared types
│   └── service/        # Core business logic & domain services
```

### Strict Service Boundary Rule
**Only `packages/service` can talk directly to `packages/db`.**
Request handlers, RPC endpoints, queue runners, and Next.js server actions are prohibited from importing Mongoose models directly; they must invoke service methods from `packages/service`.

## Decision & PO Rationale
**Approved Option B.** The PO specified: *"make turborepo. for server, api server, queue, and make a db package and schema package with typebox validation, and a service package which will be imported by the apps.. only services can talk to DB and others like request handlers, runners, server actions can call service functions.."*

## Dependencies
- Turborepo
- pnpm / npm
