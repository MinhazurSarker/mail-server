"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/layout/app-layout";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import MetricCard from "@/components/common/metric-card";
import { rpcCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  RefreshIcon,
  ArrowRightIcon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  GlobeIcon,
  BoxIcon,
  SparkIcon,
} from "@/icons";

interface PlatformOverview {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalDomains: number;
  totalUsers: number;
  isPort25Active: boolean;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";
  primaryDomain: string;
  usersCount: number;
  domainsCount: number;
  maxStorageBytes: number;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === -1) return "Unlimited";
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function PlatformAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Onboard modal
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    slug: "",
    domainName: "",
    adminEmail: "",
    adminPassword: "",
    adminDisplayName: "",
  });
  const [onboarding, setOnboarding] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, listRes] = await Promise.all([
        rpcCall<PlatformOverview>("platform", "overview", {}),
        rpcCall<{ items: TenantItem[] }>("platform", "organizationsList", {}),
      ]);
      setOverview(ovRes);
      setTenants(listRes.items || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load platform data. Ensure you have PLATFORM_ADMIN role.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSuspend = async (orgId: string, currentStatus: string, orgName: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "SUSPENDED"
        ? `Are you sure you want to suspend "${orgName}"? Inbound Port 25 mail will continue to be received, but portal and IMAP/JMAP client logins will be blocked.`
        : `Unsuspend "${orgName}" and restore portal and client access?`;

    if (!confirm(confirmMsg)) return;

    try {
      await rpcCall("platform", "organizationStatusUpdate", {
        organizationId: orgId,
        status: nextStatus,
      });
      showToast(`Organization "${orgName}" is now ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update status.");
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.slug || !onboardForm.domainName || !onboardForm.adminEmail) {
      showToast("Please fill in all required onboarding fields.");
      return;
    }

    setOnboarding(true);
    setOnboardSuccess(null);
    try {
      const res = await rpcCall<any>("platform", "organizationOnboard", onboardForm);
      setOnboardSuccess(res);
      showToast(`Tenant "${onboardForm.name}" successfully onboarded!`);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Onboarding failed.");
    } finally {
      setOnboarding(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <AppLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="w-full min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageBreadcrumb pageTitle="Platform Governance" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-1.5 cursor-pointer"
            >
              <RefreshIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowOnboard(true);
                setOnboardSuccess(null);
              }}
              className="gap-1.5 cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Onboard Organization
            </Button>
          </div>
        </div>

        {/* Global Metric Cards (Full Width 4-column Grid) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <MetricCard
            icon={<BoxIcon />}
            title="Total Organizations"
            value={overview?.totalOrganizations ?? 0}
            change={`${overview?.activeOrganizations ?? 0} Active`}
            direction="up"
          />
          <MetricCard
            icon={<SparkIcon />}
            title="Suspended Organizations"
            value={overview?.suspendedOrganizations ?? 0}
            badge={
              (overview?.suspendedOrganizations ?? 0) > 0 ? (
                <Badge color="error" variant="light">
                  {overview?.suspendedOrganizations} Blocked
                </Badge>
              ) : (
                <Badge color="success" variant="light">
                  All Active
                </Badge>
              )
            }
          />
          <MetricCard
            icon={<GlobeIcon />}
            title="Platform Domains"
            value={overview?.totalDomains ?? 0}
            change={`${overview?.totalUsers ?? 0} Total Users`}
            direction="up"
          />
          <MetricCard
            icon={<UsersIcon />}
            title="Port 25 MTA"
            value={overview?.isPort25Active ? "ONLINE" : "OFFLINE"}
            badge={
              <Badge color={overview?.isPort25Active ? "success" : "error"} variant="light">
                <span className={`size-1.5 rounded-full ${overview?.isPort25Active ? "bg-green-500 animate-pulse" : "bg-red-500"} mr-1.5`} />
                {overview?.isPort25Active ? "Listening (25)" : "Stopped"}
              </Badge>
            }
          />
        </div>

        {/* Tenants Table (Full Width Card) */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-theme-xs">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Tenant Organizations
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Sovereign multi-tenant email domains, users, and suspension enforcement.
              </p>
            </div>
            <Badge variant="light" color="primary">
              {tenants.length} Tenants
            </Badge>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/2">
                <TableRow>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Organization
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Primary Domain
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Users
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Domains
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Storage Quota
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-end text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      No tenant organizations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50/60 dark:hover:bg-white/3 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {t.name}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            /{t.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {t.primaryDomain || "—"}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="light"
                          color={t.status === "ACTIVE" ? "success" : "error"}
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {t.usersCount}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {t.domainsCount}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                        {formatBytes(t.maxStorageBytes)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleToggleSuspend(t.id, t.status, t.name)}
                            className={
                              t.status === "ACTIVE"
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                            }
                          >
                            {t.status === "ACTIVE" ? "Suspend" : "Unsuspend"}
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => router.push(`/org/${t.slug}/admin`)}
                            className="gap-1"
                          >
                            <span>Manage</span>
                            <ArrowRightIcon className="size-3 rtl:-scale-x-100" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Onboard Organization Modal */}
      <Dialog open={showOnboard} onOpenChange={setShowOnboard}>
        <DialogContent className="sm:max-w-xl p-6">
          <DialogHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Onboard Sovereign Tenant
            </DialogTitle>
          </DialogHeader>

          {onboardSuccess ? (
            <div className="space-y-4 pt-3">
              <div className="rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-900/50">
                <p className="font-semibold text-sm">Tenant successfully created!</p>
                <p className="text-xs mt-1">DNS verification token and administrator credentials generated.</p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-gray-50 rounded-xl dark:bg-white/5 space-y-1">
                  <div className="text-gray-400">DNS Verification Token (TXT):</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white select-all">
                      {onboardSuccess.domain?.verificationToken}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => copyToClipboard(onboardSuccess.domain?.verificationToken, "token")}
                    >
                      {copiedKey === "token" ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl dark:bg-white/5 space-y-1">
                  <div className="text-gray-400">Admin Initial Password:</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white select-all">
                      {onboardSuccess.adminUser?.temporaryPassword || "Password as configured"}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => copyToClipboard(onboardSuccess.adminUser?.temporaryPassword || "", "pass")}
                    >
                      {copiedKey === "pass" ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={() => setShowOnboard(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Organization Name
                  </label>
                  <Input
                    placeholder="Acme Corp"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Slug
                  </label>
                  <Input
                    placeholder="acme"
                    value={onboardForm.slug}
                    onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Primary Domain
                </label>
                <Input
                  placeholder="acme.com"
                  value={onboardForm.domainName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, domainName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@acme.com"
                    value={onboardForm.adminEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Admin Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Temporary password"
                    value={onboardForm.adminPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowOnboard(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={onboarding}>
                  {onboarding ? "Provisioning..." : "Onboard Organization"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
