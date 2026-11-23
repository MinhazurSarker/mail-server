# ADR-007: Multi-Tenant Privacy Model & Administration Hierarchy

- **Decision Identifier:** ADR-007
- **Topic:** Tenant Boundaries, Privacy Rules & Administrative Roles
- **Date:** 2026-11-22
- **Status:** Approved
- **Product Owner:** User

---

## Context & Problem Statement
In an enterprise multi-tenant mail platform, we must define the administrative hierarchy, tenant boundaries, and access privileges—specifically regarding who is permitted to view message content.

## Alternatives Considered
- **Option A: Universal Super-Admin Visibility:** Platform administrators can view all data, including tenant emails.
- **Option B: Complete Isolation (Zero Admin Visibility):** Neither platform nor organization admins can view user mail.
- **Option C: Enterprise Strict Privacy with Compliance Visibility (Approved):**
  - Platform Super Admin manages infrastructure and tenant approvals, but is strictly prohibited from viewing tenant email content.
  - Organization Admin manages all domains and users in their tenant and possesses compliance visibility over their organization's users' mail.
  - Platform owner must onboard as an Organization to access email mailboxes.

## Decision & PO Rationale
**Approved Option C.** The PO decided:
*"Platform admin, support team.. even me who owns this, needs an organization to use email. and I need to onboard myself, then approve from the admin,, same for other tenants. organizations are tenants.. one org can have multiple domains, each org has org admins from any of its domains, then users.. I think we don't need domain admin.. org admin can do all and must do all.. manage his users and so.. and admin also see everything from his end, but can't see other's messages... only org admin can see his user's messages.. not platform admin."*

## Role Definitions & Boundaries
1. **Platform Super Admin & Support Team:**
   - Approves/suspends Organizations.
   - Monitors mail server health, queue statistics, and delivery diagnostics.
   - Manages host SSL certificates.
   - **STRICT PRIVACY ENFORCEMENT:** No access to message bodies, subjects, headers, or attachments.
2. **Organization Admin (Tenant Admin):**
   - Manages multiple domains belonging to the organization.
   - Configures the Organization's S3/R2 storage credentials.
   - Manages users, quotas, and API sending permissions.
   - Holds compliance visibility over messages sent/received by organization users.
3. **Mailbox User:**
   - Manages personal inbox, sent mail, folders, and personal settings.
   - Generates API keys if granted permission by Org Admin.
4. **Platform Owner Parity:**
   - The platform creator onboards an Organization like any tenant and gets approved to use mailboxes.

## Dependencies
- Mongoose RBAC schema
- Role-based middleware in `packages/service`
