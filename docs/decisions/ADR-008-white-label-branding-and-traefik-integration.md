# ADR-008: Multi-Tenant White-Label Webmail CNAME & Traefik TLS Hot-Reloading

## Status
Accepted

## Context
CellsInbox operates as a sovereign multi-tenant email platform for `cellsweb.com`:
- `mail.cellsweb.com` serves as the inbound SMTP receiver (Port 25) and outbound MTA HELO identifier.
- `webmail.cellsweb.com` serves as the primary Next.js webmail and governance portal.
- Tenant organizations hosted on the platform require white-label branding, allowing their users to point a DNS CNAME (e.g. `webmail.tenantcorp.com CNAME webmail.cellsweb.com`).
- When navigating to `webmail.tenantcorp.com`, the system must automatically detect the requesting hostname, load the tenant's custom logo, company display name, favicon, and brand color.
- In production, Dokploy runs Traefik which manages ACME Let's Encrypt certificates in `acme.json`, extracted by a cert-dumper into persistent `.pem` files on disk. The inbound SMTP daemon on Port 25 must hot-reload these renewed certificates without dropping connections or requiring manual container restarts.

## Decision
1. **White-Label Branding Schema & Resolution:**
   - Extended `OrganizationModel` with `branding: { logoUrl, faviconUrl, companyName, primaryColor }` and `customWebmailDomains: string[]`.
   - Implemented `OrganizationService.resolveBrandingByHost(host)`:
     - System hosts (`cellsweb.com`, `webmail.cellsweb.com`, `mail.cellsweb.com`, `localhost`) return default sovereign CellsInbox branding.
     - Custom hostnames are matched first against `customWebmailDomains` (explicit CNAME mappings) and second against tenant verified base domains (`DomainModel`) by stripping standard subdomains (`webmail.`, `mail.`).
     - Matching organizations return their custom logo, company title, and accent color.
   - Exposed public RPC endpoint `auth.branding` consumed by `LoginPage` on initial load and by webmail layouts.
   - Added a "White-Label & Branding" tab in the Organization Admin governance panel (`apps/web/src/app/(admin)/admin/page.tsx`) with a live login preview and CNAME configuration instructions.

2. **Traefik Cert Dumper & In-Memory Hot-Reload:**
   - Added an active `fs.watch` file watcher on `SMTP_TLS_CERT_PATH` in `apps/server/src/index.ts`.
   - When Traefik's cert-dumper writes renewed certificates to the mounted static path, `apps/server` immediately calls `server.updateSecureContext({ key, cert })` to update the TLS context in-memory with zero downtime.

3. **Cloudflare Proxying Boundary:**
   - **Port 25 (MX destination `mail.cellsweb.com`):** MUST be DNS-only (Grey Cloud) on Cloudflare, as Cloudflare CDN drops SMTP Port 25 traffic.
   - **Port 443 (Webmail `webmail.cellsweb.com` and custom CNAMEs):** Routed through Traefik in Dokploy with TLS terminated via Let's Encrypt.
