# CellsInbox: Comprehensive UI Components Inventory

**Document Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 2026-11-22  

---

## 1. Inventory Summary

| Panel / Area | Pages / Routes | Modals & Dialogs | Data Tables | Forms |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Onboarding** | 3 | 0 | 0 | 3 |
| **Platform Super Admin** | 5 | 3 | 4 | 2 |
| **Organization (Tenant) Admin** | 6 | 5 | 5 | 4 |
| **Webmail Client** | 6 | 4 | 1 (Thread List) | 2 (Composer, Settings) |
| **Total Inventory** | **20 Pages** | **12 Modals** | **10 Tables** | **11 Forms** |

---

## 2. Authentication & Security Onboarding

### Pages
1. `/login`: Email and password input, with conditional Passkey biometric trigger.
2. `/onboarding/security`: Mandatory 2-step verification enrollment on first login.
   - Enrolls WebAuthn Passkey via browser biometric prompt, or displays TOTP QR code.
   - Requires password confirmation before transitioning status to `ACTIVE`.
3. `/recover`: Account recovery using emergency recovery codes.

---

## 3. Platform Super Admin Panel

### Pages & Routes
1. `/admin/platform/overview`: High-level cluster health, total organizations, active domains, inbound/outbound queue rate.
2. `/admin/platform/organizations`: Table of all tenant organizations.
   - Columns: Organization Name, Slug, Status, Domains Count, Users Count, Created At, Actions.
   - Actions: Approve, Suspend, Activate, View Details.
3. `/admin/platform/queues`: Real-time view of outbound delivery queues.
   - Columns: Message ID, Destination Domain, Attempts, Status, Next Retry, Last Error.
   - Actions: Retry Now, Purge Dead-Letter.
4. `/admin/platform/certificates`: System host SSL certificates for Port 25 STARTTLS and web endpoints.
5. `/admin/platform/logs`: System error and security audit logs.

### Modals
1. `ApproveOrganizationModal`: Confirmation dialog to approve an organization onboarding request.
2. `SuspendOrganizationModal`: Destructive modal with reason input to suspend a tenant.
3. `QueueItemDetailsModal`: Technical diagnostics of an outbound SMTP delivery failure.

---

## 4. Organization (Tenant) Admin Panel

### Pages & Routes
1. `/admin/organization/dashboard`: Overview of organization domains, mailboxes, and storage usage.
2. `/admin/organization/domains`: Domain management and DNS configuration.
   - Data Table: Domain Name, Status (`VERIFIED`/`PENDING`), SPF, DKIM, DMARC, Created At.
   - Actions: Verify DNS, View DNS Records, Delete Domain.
3. `/admin/organization/storage`: Bring-Your-Own-Storage (BYOS) configuration.
   - Form Fields: Storage Provider (Cloudflare R2, AWS S3, Custom MinIO), S3 Endpoint, Bucket Name, Region, Access Key ID, Secret Access Key.
   - Actions: "Test S3 Connection", "Save Configuration".
4. `/admin/organization/users`: User accounts and mailboxes.
   - Data Table: Email, Role (`ORG_ADMIN`/`MAILBOX_USER`), Status, 2FA Status, API Permitted, Storage Used.
   - Actions: Edit User, Reset Password, Toggle API Perms, Suspend Account.
5. `/admin/organization/api-keys`: SendGrid-style API keys for programmatic mail sending.
   - Data Table: Key Name, Prefix (`ci_live_...`), Allowed Domains, Rate Limit, Last Used At.
   - Actions: Create Key, Revoke Key.
6. `/admin/organization/compliance`: Message inspection and audit logs for organization compliance.

### Modals
1. `AddDomainModal`: Enter new domain name, generates required DNS TXT, MX, and DKIM keys.
2. `CreateUserModal`: Select domain, enter username, display temporary password.
3. `CreateApiKeyModal`: Name key, select allowed domains, define rate limits, displays full raw key once.
4. `EditUserQuotaModal`: Adjust mailbox storage allocation.
5. `RevokeApiKeyModal`: Confirm key destruction.

---

## 5. Webmail Client

### Views & Layout
1. `WebmailShell`: 3-pane layout (Folder Navigation | Thread List | Reader/Composer).
2. `/mail/inbox`: Main inbox view.
3. `/mail/sent`: Outbound messages.
4. `/mail/drafts`: Editable draft messages.
5. `/mail/trash`: Deleted messages.
6. `/mail/settings`: User security preferences, Passkey management, TOTP configuration, personal API keys.

### Components & Modals
1. `ComposerModal`: Floating or docked rich-text email composer:
   - Fields: From Identity, To, CC, BCC, Subject, Rich Text Body, Attachment Dropzone.
   - Actions: Send, Save Draft, Discard.
2. `MessageReader`: Clean rendering of email body, headers, attachments list, and quick reply actions.
3. `AttachmentViewerModal`: Preview images and PDFs directly in the browser.
4. `RegisterPasskeyModal`: Browser WebAuthn prompt dialog for adding new biometric keys.
