"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  Server,
  Globe,
  Users,
  Building,
  Plus,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-2xl animate-in fade-in duration-200">
          {toast}
        </div>
      )}

      {/* Platform Header */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="size-3.5" />
              Back to Mail
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="font-semibold text-sm">Platform Admin Governance</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
              Sovereign Master
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1 text-xs">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setShowOnboard(true); setOnboardSuccess(null); }} className="gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Onboard New Organization
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Multi-Tenant Platform Governance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oversee tenant organizations, onboard new sovereign domains, and govern active versus suspended tenants.
          </p>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-border/60">
            <span className="text-xs text-muted-foreground font-medium">Total Organizations</span>
            <div className="text-2xl font-bold mt-1 text-primary">{overview?.totalOrganizations ?? 0}</div>
          </Card>
          <Card className="p-4 border-border/60">
            <span className="text-xs text-muted-foreground font-medium">Active Tenants</span>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{overview?.activeOrganizations ?? 0}</div>
          </Card>
          <Card className="p-4 border-border/60">
            <span className="text-xs text-muted-foreground font-medium">Suspended Tenants</span>
            <div className="text-2xl font-bold mt-1 text-destructive">{overview?.suspendedOrganizations ?? 0}</div>
          </Card>
          <Card className="p-4 border-border/60">
            <span className="text-xs text-muted-foreground font-medium">Port 25 MTA Inbound</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-500">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              PORT 25 ACTIVE
            </div>
          </Card>
        </div>

        {/* Tenant Directory Table */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Onboarded Organizations</CardTitle>
                <CardDescription className="text-xs">
                  Directory of all sovereign tenants with independent domains, user quotas, and governance status.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {tenants.length} Tenants
              </Badge>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug & Routing</TableHead>
                <TableHead>Primary Domain</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Governance Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((org) => {
                const isSuspended = org.status === "SUSPENDED";
                return (
                  <TableRow key={org.id} className={isSuspended ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="size-4 text-muted-foreground" />
                        <span>{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/org/${org.slug}/admin`}
                        className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        /org/{org.slug}/admin
                        <ExternalLink className="size-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {org.primaryDomain}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {org.usersCount} mailboxes
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isSuspended ? "destructive" : "default"}
                        className="text-[10px] font-semibold"
                      >
                        {isSuspended ? "SUSPENDED" : "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant={isSuspended ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => handleToggleSuspend(org.id, org.status, org.name)}
                        className={`text-xs h-7 px-2.5 ${
                          isSuspended
                            ? "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                            : "text-destructive hover:bg-destructive/10"
                        }`}
                      >
                        {isSuspended ? (
                          <span className="flex items-center gap-1">
                            <PlayCircle className="size-3" /> Unsuspend
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <PauseCircle className="size-3" /> Suspend
                          </span>
                        )}
                      </Button>
                      <Link href={`/org/${org.slug}/admin`}>
                        <Button size="sm" variant="secondary" className="text-xs h-7 px-2.5 gap-1">
                          Manage Tenant
                          <ArrowRight className="size-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No organizations onboarded yet. Click "Onboard New Organization" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* ONBOARD NEW TENANT MODAL */}
      {showOnboard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl border-border bg-card shadow-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building className="size-4 text-primary" />
                  Onboard New Tenant Organization
                </CardTitle>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowOnboard(false)}>
                  ✕
                </Button>
              </div>
              <CardDescription className="text-xs">
                Provision a dedicated tenant with unique slug, custom domain, and tenant administrator.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleOnboardSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <CardContent className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Organization Name *</Label>
                    <Input
                      required
                      value={onboardForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                        setOnboardForm({
                          ...onboardForm,
                          name,
                          slug: onboardForm.slug ? onboardForm.slug : autoSlug,
                        });
                      }}
                      placeholder="e.g. Acme Corporation"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unique URL Slug *</Label>
                    <Input
                      required
                      value={onboardForm.slug}
                      onChange={(e) =>
                        setOnboardForm({
                          ...onboardForm,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      placeholder="e.g. acme"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-2 bg-muted/40 rounded border border-border/40 text-[11px] text-muted-foreground font-mono">
                  Portal URL Preview: <span className="text-primary font-bold">/org/{onboardForm.slug || "<slug>"}/admin</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Primary Domain *</Label>
                  <Input
                    required
                    value={onboardForm.domainName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, domainName: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. acme.com"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tenant Admin Email *</Label>
                    <Input
                      required
                      type="email"
                      value={onboardForm.adminEmail}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value.toLowerCase().trim() })}
                      placeholder="admin@acme.com"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Admin Display Name</Label>
                    <Input
                      value={onboardForm.adminDisplayName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminDisplayName: e.target.value })}
                      placeholder="Acme Admin"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Initial Admin Password (min 8 chars) *</Label>
                  <Input
                    required
                    type="password"
                    value={onboardForm.adminPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="text-xs font-mono"
                  />
                </div>

                {/* Onboarding Success DNS Records Card */}
                {onboardSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-500">
                      <CheckCircle2 className="size-4" />
                      Tenant Provisioned! Required DNS Records:
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {onboardSuccess.dnsRecords.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-card p-2 rounded border border-border/40 text-[11px] font-mono flex items-center justify-between">
                          <div>
                            <span className="font-bold text-primary mr-2">{rec.type}</span>
                            <span className="text-muted-foreground mr-2">{rec.name}</span>
                            <span className="text-foreground truncate max-w-xs">{rec.value}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0"
                            onClick={() => copyToClipboard(rec.value, `dns-${idx}`)}
                          >
                            {copiedKey === `dns-${idx}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="shrink-0 flex justify-end gap-2 border-t border-border/40 py-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowOnboard(false)}>
                  {onboardSuccess ? "Done" : "Cancel"}
                </Button>
                {!onboardSuccess && (
                  <Button type="submit" size="sm" disabled={onboarding}>
                    {onboarding ? "Provisioning..." : "Onboard Organization"}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
