# ADR-005: Tenant BYOS S3/R2 Storage & Mongoose Normalization

- **Decision Identifier:** ADR-005
- **Topic:** Message Storage, Attachment Offloading & Data Normalization
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
Email messages frequently contain large MIME payloads and multi-megabyte attachments. Storing raw emails directly in MongoDB risks hitting BSON's 16MB limit, pollutes the WiredTiger cache, degrades query performance, and forces platform operators to shoulder high storage infrastructure costs.

## Alternatives Considered
- **Option A: Monolithic MongoDB Documents:** Storing all headers, body HTML, and attachments directly in a single `messages` collection.
- **Option B: Centralized Platform Object Storage:** Platform provides and pays for an S3 bucket for all tenants.
- **Option C: Tenant Bring-Your-Own-Storage (BYOS) S3/R2 + Normalized Mongoose Collections (Approved):** Every organization provides their own S3-compatible credentials (e.g. Cloudflare R2, AWS S3, MinIO). Attachments and raw MIME streams are offloaded directly to the tenant's bucket. MongoDB stores parsed, relational metadata.

## Decision & PO Rationale
**Approved Option C.** The PO decided:
*"gotta use mongoose and parse them and store clean data (if it is good) and relational staffs using ref id.. so we spread the doc to multiple doc"*
*"we force every organization to bring an S3 compatible api like cloudflare r2. for both attachments and anything that can be offloaded to storage from the mongodb.. so they pay for their own storage.. db must be very fast and load free."*

## Data Architecture
1. **Tenant S3/R2 Bucket:** Stores raw immutable RFC 5322 MIME blobs and binary attachments.
2. **MongoDB / Mongoose Collections:**
   - `messages`: Core metadata (Message-ID, from, to, subject, S3 object keys).
   - `message_bodies`: Extracted text and HTML snippets for instant webmail rendering.
   - `attachments`: File metadata (filename, content-type, size, S3 key, content-id).
   - `mailbox_states`: Per-user state (folders, read/unread, starred, labels) linked via `ref` ObjectIds.

## Dependencies
- `@aws-sdk/client-s3` (compatible with Cloudflare R2, AWS S3, MinIO)
- `mongoose`
- `mailparser`
