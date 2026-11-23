# CellsInbox: Automated TLS Certificate Lifecycle & Inbound STARTTLS

**Document Version:** 1.0.0  
**Target:** Production Self-Hosted Deployment  
**Status:** Complete  

---

## 1. Overview & Architecture

CellsInbox requires modern TLS encryption for two distinct traffic planes:
1. **Web Traffic (HTTPS & WSS):** Port 443 terminated at the host reverse proxy (Nginx, Caddy, or Traefik) proxying to `apps/web` (port 3000) and `apps/api-server` (port 4000).
2. **Inbound Mail Traffic (STARTTLS):** Port 25 handled directly by `apps/server` (`cellsinbox_server`). Incoming MTAs (Gmail, Outlook, Yahoo) initiate plain ESMTP connections, execute `STARTTLS`, negotiate TLS 1.2/1.3, and transmit encrypted mail.

```
                    Internet (Port 443 HTTPS)
                               │
                               ▼
               ┌───────────────────────────────┐
               │    Host Reverse Proxy         │
               │    (Nginx / Caddy / Traefik)  │
               └───────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       apps/web (Port 3000)        apps/api-server (Port 4000)
       (Next.js UI)                (CellsWeb RPC + WebSockets)

                    Internet (Port 25 Inbound)
                               │
                               ▼
               ┌───────────────────────────────┐
               │  apps/server (Port 25)        │
               │  Inbound SMTP (STARTTLS)      │
               └───────────────┬───────────────┘
                               │ Reads /etc/letsencrypt/live/...
               ┌───────────────┴───────────────┐
               │  Certbot Automated ACME       │
               │  Lifecycle & Deploy Hook      │
               └───────────────────────────────┘
```

---

## 2. Automated Certificate Provisioning with Certbot

To obtain free, trusted certificates from Let's Encrypt for your mail server hostname (e.g., `mail.yourdomain.com`):

### Step 1: Install Certbot
```bash
# On Ubuntu / Debian:
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Step 2: Request Certificate via ACME Standalone or Webroot
If Nginx is running as the reverse proxy on Port 80/443:
```bash
sudo certbot certonly --webroot -w /var/www/html \
  -d mail.yourdomain.com \
  --email postmaster@yourdomain.com \
  --agree-tos \
  --no-eff-email
```

Certbot places certificates in:
- Certificate & Full Chain: `/etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/mail.yourdomain.com/privkey.pem`

---

## 3. Connecting STARTTLS to `apps/server` (Port 25)

The inbound SMTP receiver (`apps/server`) natively loads the certificates configured in `.env.production`:
```env
SMTP_TLS_KEY_PATH=/etc/letsencrypt/live/mail.yourdomain.com/privkey.pem
SMTP_TLS_CERT_PATH=/etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem
```

When running under Docker Compose, `/etc/letsencrypt` is mounted into `cellsinbox_server` read-only:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## 4. Zero-Downtime Automated Renewal Deploy Hook

Let's Encrypt certificates renew every 60–90 days. Certbot automatically triggers renewal via systemd timers. To make sure `cellsinbox_server` and your reverse proxy reload the updated certificates immediately upon renewal:

### Create Deploy Hook: `/etc/letsencrypt/renewal-hooks/deploy/cellsinbox-reload.sh`
```bash
#!/usr/bin/env bash
set -e

echo "[Certbot Deploy Hook] Reloading CellsInbox TLS certificates..."

# 1. Reload host reverse proxy (Nginx example)
if systemctl is-active --quiet nginx; then
  systemctl reload nginx
  echo "[Certbot Deploy Hook] Nginx reloaded successfully."
fi

# 2. Restart Inbound SMTP container to load renewed certificates
if docker ps --format '{{.Names}}' | grep -q "cellsinbox_server"; then
  docker restart cellsinbox_server
  echo "[Certbot Deploy Hook] cellsinbox_server restarted with fresh certificates."
fi
```

### Make Hook Executable:
```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/cellsinbox-reload.sh
```

### Test Renewal Dry Run:
```bash
sudo certbot renew --dry-run
```

---

## 5. Verifying STARTTLS on Wire

From any remote terminal, verify your server negotiates encrypted STARTTLS cleanly:

```bash
openssl s_client -starttls smtp -connect mail.yourdomain.com:25 -showcerts
```

Expected output:
```text
CONNECTED(00000003)
---
Certificate chain
 0 s:CN = mail.yourdomain.com
   i:C = US, O = Let's Encrypt, CN = R10
---
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : TLS_AES_256_GCM_SHA384
```
