# CellsInbox: Production Deployment & Sovereign Security Hardening Guide

**Document Version:** 1.0.0  
**Target:** Sovereign Bare-Metal / Dedicated Host / Cloud VPS Deployment  
**Status:** Production Ready  

---

## 1. Production Architecture Overview

CellsInbox is designed to operate as a completely self-contained mail infrastructure stack on a server with an unblocked Port 25:
- **Port 25 (Inbound SMTP):** Handled directly by `cellsinbox_server` with STARTTLS support.
- **Port 4000 (CellsWeb RPC & WebSockets):** High-speed internal API server.
- **Port 3000 (Unified Webmail & Admin):** Next.js App Router client with raw shadcn UI and ui-sdk behavioral primitives.
- **Worker (MTA Delivery):** Node.js outbound queue worker with 2048-bit RSA DKIM signing (`s=ci`) and direct-to-MX routing.
- **Port 27017 (MongoDB 7.0):** Enterprise document database running isolated in a dedicated Docker network.

---

## 2. DNS Infrastructure & Deliverability Matrix

For emails to achieve 100% inbox placement across major providers (Google, Microsoft, Yahoo), configure the following DNS records on your public domain (`cellsweb.com`):

| Record Type | Hostname / Subdomain | Target / Value | Cloudflare Proxy Status | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A Record** | `mail.cellsweb.com` | `<SERVER_PUBLIC_IP>` | **DNS ONLY (Grey Cloud)** | **MANDATORY:** Cloudflare proxy blocks Port 25. |
| **A / CNAME**| `webmail.cellsweb.com` | `<SERVER_PUBLIC_IP>` | Proxied (Orange) or Grey | Next.js Webmail & Admin UI via Traefik. |
| **PTR (rDNS)** | `<SERVER_PUBLIC_IP>` | `mail.cellsweb.com` | N/A (Set at VPS host) | **CRITICAL:** Set at host console to match HELO. |
| **MX Record** | `@` (root) | Priority: `10`, Target: `mail.cellsweb.com` | DNS ONLY (Grey Cloud) | Directs inbound mail to sovereign Port 25. |
| **TXT (SPF)** | `@` (root) | `v=spf1 mx ~all` | DNS ONLY | Authorizes host MX IP to send mail. |
| **TXT (DKIM)**| `ci._domainkey` | `v=DKIM1; k=rsa; p=<PUBLIC_KEY_PEM>` | DNS ONLY | Cryptographic DKIM 2048-bit public key. |
| **TXT (DMARC)**| `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc@cellsweb.com;` | DNS ONLY | Enforces SPF/DKIM alignment and reporting. |

---

## 3. Multi-Tenant White-Label CNAME Setup

Tenants on CellsInbox can point custom domains to your webmail endpoint for complete white-label branding:

1. **Tenant DNS Record:**
   ```text
   webmail.tenantcorp.com.  CNAME  webmail.cellsweb.com.
   ```
2. **Automatic Domain & Brand Resolution:**
   - In the Organization Admin panel under **White-Label & Branding**, the tenant registers `webmail.tenantcorp.com` and uploads their company logo URL, favicon, and brand color.
   - When a user navigates to `https://webmail.tenantcorp.com`, CellsInbox automatically identifies the host header, loads the tenant's logo and company name on the `/login` screen, and applies their brand styling.
   - Traefik automatically provisions an SSL certificate for the CNAME via ACME HTTP-01 or DNS-01 challenges.

---

## 4. Dokploy & Traefik Certificate Dumper Integration

In Dokploy, Traefik stores Let's Encrypt certificates in `acme.json`. The certificate dumper tool dumps these into standard PEM files at a fixed path (e.g. `/etc/dokploy/traefik/certs/privkey.pem` and `fullchain.pem`):
- Mount this directory into the `smtp_server` container:
  ```yaml
  volumes:
    - /etc/dokploy/traefik/certs:/certs:ro
  ```
- Configure environment variables in `.env.production`:
  ```env
  SMTP_TLS_KEY_PATH=/certs/privkey.pem
  SMTP_TLS_CERT_PATH=/certs/fullchain.pem
  ```
- **Zero-Downtime Hot-Reload:** `apps/server` actively monitors the certificate file via `fs.watch`. When Traefik renews the certificate and the dumper writes the file, `apps/server` immediately updates the TLS context in-memory (`server.updateSecureContext({ key, cert })`) without restarting the container!

---

## 3. Host Firewall & Port Policy (UFW / iptables)

Never expose internal database or service ports to the public internet:

```bash
# Allow SSH management
sudo ufw allow 22/tcp

# Allow Web Reverse Proxy (HTTP & HTTPS)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Inbound ESMTP (Port 25)
sudo ufw allow 25/tcp

# Explicitly ensure internal ports are NOT open publicly
sudo ufw deny 27017/tcp  # MongoDB strictly private
sudo ufw deny 4000/tcp   # RPC API served only via reverse proxy
sudo ufw deny 587/tcp    # No legacy submission port exposed!

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 4. Host Reverse Proxy (Nginx Configuration)

Configure Nginx to proxy HTTPS traffic to `apps/web` (port 3000) and `apps/api-server` (port 4000):

```nginx
server {
    listen 80;
    server_name mail.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # RPC API Endpoints
    location /rpc {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Real-Time WebSockets
    location /ws {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Webmail & Admin UI
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Deployment Step-by-Step

1. Clone or pull repository to server:
   ```bash
   git clone <repo-url> /opt/cellsinbox
   cd /opt/cellsinbox
   ```

2. Copy and configure production environment variables:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

3. Obtain Let's Encrypt certificate:
   ```bash
   sudo certbot certonly --standalone -d mail.yourdomain.com
   ```

4. Launch services via Docker Compose:
   ```bash
   docker compose --env-file .env.production up -d --build
   ```

5. Verify running containers:
   ```bash
   docker compose ps
   ```

6. Inspect logs:
   ```bash
   docker compose logs -f smtp_server
   docker compose logs -f queue_worker
   ```
