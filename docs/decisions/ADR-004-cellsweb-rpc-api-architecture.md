# ADR-004: CellsWeb RPC API Architecture

- **Decision Identifier:** ADR-004
- **Topic:** Client-Server API Architecture
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
The React/Next.js frontend and external integrations require a fast, type-safe, and structured communication protocol with the backend.

## Alternatives Considered
- **Option A: Traditional RESTful API Only:** Standard JSON over HTTP with OpenAPI specs.
- **Option B: CellsWeb RPC Framework (Approved):** High-performance RPC architecture utilizing `@cellsweb/rpc-core` on the backend and `@cellsweb/rpc-client` on the frontend, scaffolded via `create-cellsweb-rpc-api` / `create:function`.
- **Option C: Dual RPC + REST:** Maintaining two parallel API implementations.

## Decision & PO Rationale
**Approved Option B.** The Product Owner explicitly instructed:
*"use https://www.npmjs.com/package/@cellsweb/rpc-core and https://www.npmjs.com/package/@cellsweb/rpc-client and must use this for scaffolding the api server npm i create-cellsweb-rpc-api and npm or pnpm create:function thing.. see more at https://cellsweb.github.io/crpc-node/ for more info how to use it."*

## Key Architectural Capabilities
- **$O(1)$ Dispatch:** Rapid method lookup and execution.
- **TypeBox Validation:** Schema-enforced request and response payloads.
- **Integrated Multipart Support:** Native handling of attachment streams and file uploads via Busboy.
- **Client SDK Integration:** `@cellsweb/rpc-client` provides universal fetch and seamless React state integration.

## Dependencies
- `@cellsweb/rpc-core`
- `@cellsweb/rpc-client`
- `create-cellsweb-rpc-api`
- `@sinclair/typebox`
