# CellsInbox: UI Instructions & Guidelines

**Document Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 2026-11-22  

---

## 1. Visual & Architectural Foundation

CellsInbox UI is built on **Next.js (App Router)** and **React**.

- **Design Tone:** Modern, clean, responsive, enterprise-grade dark/light mode interface.
- **Core Viewports:** Desktop-first with full mobile responsiveness for Webmail.
- **Real-Time Integration:** All mailbox state changes (read/unread, folder moves, new email arrival) are driven by **WebSockets** and synced with local React state.

---

## 2. Platform Navigation Structure

The Next.js application organizes three distinct panels behind role-based routing:

```
apps/web/src/app/
├── (auth)/
│   ├── login/                     # Primary credential login
│   ├── onboarding/                # Mandatory 2FA setup (Passkey / TOTP)
│   └── recover/                   # Account recovery with recovery codes
├── (admin)/
│   ├── platform/                  # Platform Super Admin & Support
│   └── organization/              # Organization (Tenant) Admin
└── (mail)/
    └── inbox/                     # Webmail application (Inbox, threads, composer)
```

---

## 3. UI Guidelines by Panel

### A. Platform Super Admin Panel
- **Access Rule:** Platform Super Admins only.
- **Privacy Enforcement:** Under no circumstances should email message content, subjects, or attachments be rendered in any platform admin table or inspection modal.
- **Key Modules:**
  - *Organizations:* Table of tenants, status badge, approve/suspend actions.
  - *Server Metrics:* Inbound/Outbound SMTP connection status, port 25 health, active queue size.
  - *Queue Monitor:* Delivery job counts, retry logs, bounce statistics.
  - *System Certificates:* Host TLS certificate expiry monitor.

### B. Organization (Tenant) Admin Panel
- **Access Rule:** Organization Admins only.
- **Key Modules:**
  - *Domain Management:* Add domain, view DNS records (MX, TXT SPF, DKIM, DMARC), verify domain DNS status.
  - *Storage Configuration (BYOS):* Form to configure and test S3/R2 credentials (endpoint, bucket, access key, secret key). Includes a live "Test Connection" button.
  - *Users & Mailboxes:* Table of accounts, create user modal (generates temporary password), quota allocation, toggle API permission.
  - *API Keys:* Create SendGrid-style API keys, set rate limits, view prefix `ci_live_...` (full key shown only once).
  - *Organization Audit & Compliance:* Message logs across organization users for administrative and legal compliance.

### C. Webmail Application
- **Access Rule:** All active users.
- **Layout:** Standard 3-column split view (Folder navigation | Thread/Message list | Message reader / Composer).
- **Features:**
  - *Real-Time Message List:* Unread counter badges, avatars, snippet previews, date formatting, star toggles.
  - *Message Reader:* Sanitized HTML viewer, attachment pill downloads (fetching pre-signed URLs from tenant S3), reply/forward actions.
  - *Composer Modal:* Multi-recipient tags (To, CC, BCC), rich-text editing, drag-and-drop attachment upload (streams to tenant S3/R2 via RPC API), draft autosave.
  - *Security Settings:* Enrolled Passkeys list, register new Passkey, TOTP reset, generate API keys (if permitted).

---

## 4. Accessibility & Error Handling

- **Keyboard Navigation:** Full shortcut support in Webmail (`j`/`k` for message navigation, `c` for compose, `e` for archive, `Delete` for trash).
- **Empty States:** Clear, helpful empty states for every folder (Inbox, Sent, Drafts, Trash).
- **Loading & Optimistic Updates:** Optimistic UI updates when marking emails as read or starring, with automatic rollback if an RPC network error occurs.
