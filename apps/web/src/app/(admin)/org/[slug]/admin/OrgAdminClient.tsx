"use client";

import { useEffect, useState, useCallback, useMemo, useId } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import MetricCard from "@/components/common/metric-card";
import { rpcCall } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  Server,
  Globe,
  Users,
  Key,
  HardDrive,
  CloudUpload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Code,
  Lock,
  Cloud,
  Sliders,
  Save,
  Check,
  Palette,
  Copy,
  FileText,
  Upload,
  Send,
  Sparkles,
  Paperclip,
  Layers,
  Infinity as InfinityIcon,
  HelpCircle,
} from "lucide-react";

interface AdminOverview {
  organizationName: string;
  slug?: string;
  status?: string;
  domainsCount: number;
  usersCount: number;
  apiKeysCount: number;
  storageProvider: string;
  sesBackupEnabled: boolean;
  isPrimaryPort25Active: boolean;
}

interface DomainItem {
  id: string;
  name: string;
  isVerified: boolean;
  verificationToken: string;
  dkimSelector: string;
  dkimPublicKey: string;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
  mxStatus: string;
  createdAt: string;
}

interface UserItem {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  status: string;
  twoFactorEnforced: boolean;
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
  createdAt: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  createdAt: string;
}

interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  description?: string;
  createdAt: string;
}

interface PolicyData {
  enforceTwoFactor: boolean;
  spamThresholdScore: number;
  rejectUnverifiableSpf: boolean;
  rejectUnverifiableDkim: boolean;
  maxSingleFileSizeBytes: number; // in bytes, -1 for unlimited
  maxAttachmentCount: number; // count, -1 for unlimited
  defaultUserStorageBytes: number; // in bytes, -1 for unlimited
  maxStorageBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === -1) return "Unlimited";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function TenantAdminPage({
  slug: propSlug,
  currentUser,
}: {
  slug?: string;
  currentUser?: any;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const slug = propSlug || (params?.slug as string) || "";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "domains" | "users" | "policies" | "templates" | "storage" | "branding" | "apikeys"
  >("overview");

  // Overview state
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  // Policies & Quotas
  const [policyForm, setPolicyForm] = useState<PolicyData>({
    enforceTwoFactor: true,
    spamThresholdScore: 5,
    rejectUnverifiableSpf: false,
    rejectUnverifiableDkim: false,
    maxSingleFileSizeBytes: 26214400, // 25 MB
    maxAttachmentCount: 10,
    defaultUserStorageBytes: 10737418240, // 10 GB
    maxStorageBytes: 107374182400,
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Storage BYOS
  const [storageForm, setStorageForm] = useState({
    provider: "local_fallback",
    endpoint: "https://<account-id>.r2.cloudflarestorage.com",
    bucket: "cellsinbox-blobs",
    region: "auto",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const [testingStorage, setTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Branding
  const [brandingForm, setBrandingForm] = useState({
    companyName: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0ea5e9",
    customWebmailDomains: "",
  });
  const [savingBranding, setSavingBranding] = useState(false);

  // Modals
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [domainDnsDetails, setDomainDnsDetails] = useState<any | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserDisplayName, setNewUserDisplayName] = useState("");
  const [newUserDomainId, setNewUserDomainId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ORG_ADMIN" | "MAILBOX_USER">("MAILBOX_USER");
  const [createdUserCreds, setCreatedUserCreds] = useState<{ email: string; tempPass: string } | null>(null);

  // Template Creation & Campaign Dispatch
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    description: "",
  });
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  // API Key Management
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    allowedDomains: [] as string[],
    rateLimitPerMinute: 60,
  });
  const [creatingKey, setCreatingKey] = useState(false);
  const [generatedSecretKey, setGeneratedSecretKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignTemplate, setSelectedCampaignTemplate] = useState<TemplateItem | null>(null);
  const [csvRawText, setCsvRawText] = useState("");
  const [parsedCsvRows, setParsedCsvRows] = useState<Array<{ to: string; variables: Record<string, string> }>>([]);
  const [dispatchingCampaign, setDispatchingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [ovRes, domRes, usrRes, polRes, storRes, brandRes, tmplRes, keyRes] = await Promise.allSettled([
        rpcCall<AdminOverview>("admin", "overview", { slug }),
        rpcCall<{ items: DomainItem[] }>("admin", "domainsList", { slug }),
        rpcCall<{ items: UserItem[] }>("admin", "usersList", { slug }),
        rpcCall<PolicyData>("admin", "policyGet", { slug }),
        rpcCall<any>("admin", "storageGet", { slug }),
        rpcCall<any>("admin", "branding-get", { slug }),
        rpcCall<{ items: TemplateItem[] }>("template", "list", {}),
        rpcCall<{ items: ApiKeyItem[] }>("apiKey", "list", {}),
      ]);

      if (ovRes.status === "fulfilled") setOverview(ovRes.value);
      if (domRes.status === "fulfilled") setDomains(domRes.value.items || []);
      if (usrRes.status === "fulfilled") setUsers(usrRes.value.items || []);
      if (polRes.status === "fulfilled") {
        setPolicyForm((prev) => ({
          ...prev,
          ...polRes.value,
        }));
      }
      if (storRes.status === "fulfilled" && storRes.value) {
        setStorageForm((prev) => ({
          ...prev,
          provider: storRes.value.provider || "local_fallback",
          endpoint: storRes.value.endpoint || prev.endpoint,
          bucket: storRes.value.bucket || prev.bucket,
          region: storRes.value.region || prev.region,
        }));
      }
      if (brandRes.status === "fulfilled" && brandRes.value) {
        setBrandingForm({
          companyName: brandRes.value.companyName || "",
          logoUrl: brandRes.value.logoUrl || "",
          faviconUrl: brandRes.value.faviconUrl || "",
          primaryColor: brandRes.value.primaryColor || "#0ea5e9",
          customWebmailDomains: (brandRes.value.customWebmailDomains || []).join(", "),
        });
      }
      if (tmplRes.status === "fulfilled") setTemplates(tmplRes.value.items || []);
      if (keyRes.status === "fulfilled") setApiKeys(keyRes.value.items || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load organization settings.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save Policy
  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    try {
      await rpcCall("admin", "policyUpdate", {
        slug,
        ...policyForm,
      });
      showToast("Security & file attachment quotas updated successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to update policies.");
    } finally {
      setSavingPolicy(false);
    }
  };

  // Save Storage
  const handleSaveStorage = async () => {
    try {
      await rpcCall("admin", "storageUpdate", {
        slug,
        ...storageForm,
      });
      showToast("Storage BYOS settings saved.");
    } catch (err: any) {
      showToast(err.message || "Failed to update storage.");
    }
  };

  // Test Storage
  const handleTestStorage = async () => {
    setTestingStorage(true);
    setStorageTestResult(null);
    try {
      const res = await rpcCall<{ success: boolean; message: string }>("admin", "storageTest", storageForm);
      setStorageTestResult(res);
    } catch (err: any) {
      setStorageTestResult({ success: false, message: err.message || "Connection failed." });
    } finally {
      setTestingStorage(false);
    }
  };

  // Save Branding
  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      await rpcCall("admin", "branding-update", {
        slug,
        companyName: brandingForm.companyName.trim(),
        logoUrl: brandingForm.logoUrl.trim(),
        faviconUrl: brandingForm.faviconUrl.trim(),
        primaryColor: brandingForm.primaryColor.trim(),
        customWebmailDomains: brandingForm.customWebmailDomains
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      showToast("Branding & custom domains updated.");
    } catch (err: any) {
      showToast(err.message || "Failed to update branding.");
    } finally {
      setSavingBranding(false);
    }
  };

  // Add Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName) return;
    try {
      const res = await rpcCall<any>("admin", "domainAdd", {
        slug,
        name: newDomainName.toLowerCase().trim(),
      });
      setDomainDnsDetails(res);
      setNewDomainName("");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to add domain.");
    }
  };

  // Verify Domain
  const handleVerifyDomain = async (domainId: string) => {
    try {
      const res = await rpcCall<{ verified: boolean; message: string }>("admin", "domainVerify", { domainId });
      showToast(res.message);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Verification failed.");
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await rpcCall<any>("admin", "userCreate", {
        slug,
        email: newUserEmail.toLowerCase().trim(),
        displayName: newUserDisplayName.trim(),
        domainId: newUserDomainId || (domains.length > 0 ? domains[0].id : ""),
        role: newUserRole,
      });
      setCreatedUserCreds({ email: res.email, tempPass: res.temporaryPassword });
      setNewUserEmail("");
      setNewUserDisplayName("");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to create user.");
    }
  };

  // Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.subject) return;
    setCreatingTemplate(true);
    try {
      await rpcCall("template", "create", newTemplateForm);
      showToast(`Template "${newTemplateForm.name}" created.`);
      setShowCreateTemplate(false);
      setNewTemplateForm({ name: "", subject: "", bodyHtml: "", bodyText: "", description: "" });
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to create template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await rpcCall("template", "delete", { id });
      showToast("Template deleted.");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete template.");
    }
  };

  // CSV Parsing for Autonomous Campaign
  const handleCsvFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvRawText(content);
      parseCsvString(content);
    };
    reader.readAsText(file);
  };

  const parseCsvString = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const emailIndex = headers.findIndex((h) => h.toLowerCase() === "email" || h.toLowerCase() === "to");

    if (emailIndex === -1) {
      showToast("CSV must have an 'email' or 'to' column.");
      return;
    }

    const rows: Array<{ to: string; variables: Record<string, string> }> = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const toEmail = cols[emailIndex];
      if (!toEmail || !toEmail.includes("@")) continue;

      const vars: Record<string, string> = {};
      headers.forEach((h, idx) => {
        vars[h] = cols[idx] || "";
      });
      rows.push({ to: toEmail, variables: vars });
    }
    setParsedCsvRows(rows);
  };

  const handleDispatchCampaign = async () => {
    if (!selectedCampaignTemplate || parsedCsvRows.length === 0) return;
    setDispatchingCampaign(true);
    setCampaignResult(null);
    try {
      const res = await rpcCall<any>("template", "sendBatch", {
        templateId: selectedCampaignTemplate.id,
        recipients: parsedCsvRows,
      });
      setCampaignResult({ total: res.total, sent: res.sent, failed: res.failed });
      showToast(`Autonomous campaign dispatched: ${res.sent} sent, ${res.failed} failed.`);
    } catch (err: any) {
      showToast(err.message || "Campaign dispatch failed.");
    } finally {
      setDispatchingCampaign(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.name.trim()) return;
    setCreatingKey(true);
    try {
      const res = await rpcCall<{ apiKey: any; rawSecretKey: string }>("apiKey", "create", {
        name: newKeyForm.name.trim(),
        allowedDomains: newKeyForm.allowedDomains.length > 0 ? newKeyForm.allowedDomains : ["*"],
        rateLimitPerMinute: Number(newKeyForm.rateLimitPerMinute) || 60,
      });
      setGeneratedSecretKey(res.rawSecretKey);
      setApiKeys((prev) => [res.apiKey, ...prev]);
      showToast("API Key created successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to create API key.");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (apiKeyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will immediately be rejected.")) return;
    try {
      await rpcCall("apiKey", "revoke", { apiKeyId });
      setApiKeys((prev) => prev.filter((k) => k.id !== apiKeyId));
      showToast("API Key revoked successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to revoke API key.");
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="w-full min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageBreadcrumb pageTitle={`${overview?.organizationName || slug} Administration`} />
          <div className="flex items-center gap-2">
            <Badge variant="light" color={overview?.status === "SUSPENDED" ? "error" : "primary"} size="sm" className="font-mono uppercase">
              {slug} • {overview?.status || "ACTIVE"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Global Metric Cards Grid (Full Width 4 Columns) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <MetricCard
            icon={<Globe className="size-6" />}
            title="Verified Domains"
            value={overview?.domainsCount ?? 0}
            direction="up"
          />
          <MetricCard
            icon={<Users className="size-6" />}
            title="Mailbox Users"
            value={overview?.usersCount ?? 0}
            direction="up"
          />
          <MetricCard
            icon={<HardDrive className="size-6" />}
            title="Storage Engine"
            value={overview?.storageProvider?.replace("_", " ") ?? "LOCAL FALLBACK"}
            badge={
              <Badge color="primary" variant="light">
                {overview?.storageProvider || "LOCAL"}
              </Badge>
            }
          />
          <MetricCard
            icon={<Server className="size-6" />}
            title="Port 25 MTA"
            value="ONLINE"
            badge={
              <Badge color="success" variant="light">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
                Listening (25)
              </Badge>
            }
          />
        </div>

        {/* Main Content Layout (Responsive Sidebar + Full Width Content) */}
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          {/* Navigation Sidebar */}
          <aside className="w-full xl:w-65 shrink-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
            <h4 className="mb-2.5 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              GOVERNANCE TABS
            </h4>
            <div className="flex flex-row xl:flex-col gap-1 overflow-x-auto custom-scrollbar">
              {[
                { id: "overview", label: "Overview", icon: Server },
                { id: "domains", label: "Domains & DNS", icon: Globe, count: domains.length },
                { id: "users", label: "Users & Mailboxes", icon: Users, count: users.length },
                { id: "policies", label: "Policies & Quotas", icon: Sliders },
                { id: "templates", label: "Templates & Campaigns", icon: Sparkles, count: templates.length },
                { id: "storage", label: "Storage (BYOS)", icon: HardDrive },
                { id: "branding", label: "Branding", icon: Palette },
                { id: "apikeys", label: "API Keys", icon: Key, count: apiKeys.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left cursor-pointer ${
                      active
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-semibold shadow-xs"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${active ? "text-brand-500 dark:text-brand-400" : "text-gray-400"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          active ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Full-Width Content Pane (NO max-w-5xl!) */}
          <main className="flex-1 min-w-0 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Organization Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Governance statistics and infrastructure topology for {overview?.organizationName} ({slug}).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">Verified Domains</span>
                  <div className="text-2xl font-bold mt-1 text-primary">{overview?.domainsCount ?? 0}</div>
                </Card>
                <Card className="p-4 border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">Mailbox Users</span>
                  <div className="text-2xl font-bold mt-1">{overview?.usersCount ?? 0}</div>
                </Card>
                <Card className="p-4 border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">Storage Engine</span>
                  <div className="text-sm font-semibold mt-2 uppercase tracking-wide text-muted-foreground truncate">
                    {overview?.storageProvider?.replace("_", " ") ?? "LOCAL FALLBACK"}
                  </div>
                </Card>
                <Card className="p-4 border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">Port 25 MTA Status</span>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-500">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    LISTENING (ONLINE)
                  </div>
                </Card>
              </div>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Tenant Identity & Webmail Routing</CardTitle>
                  <CardDescription className="text-xs">
                    Access URL endpoints and custom branded pointers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Tenant Slug:</span>
                    <span className="font-mono font-medium">{slug}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Tenant Admin Portal:</span>
                    <span className="font-mono text-primary font-medium">/org/{slug}/admin</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Account Status:</span>
                    <Badge
                      color={overview?.status === "ACTIVE" ? "success" : "error"}
                      variant="light"
                      size="sm"
                      className="text-[10px]"
                    >
                      {overview?.status || "ACTIVE"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. POLICIES & QUOTAS */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Policies & Quotas</h2>
                <p className="text-sm text-muted-foreground">
                  Configure maximum attachment limits, individual file restrictions, user mailbox quotas, and spam thresholds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Max Single File Limit */}
                <Card className="border-border/60 relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="size-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">Max Single File Limit</CardTitle>
                      </div>
                      {policyForm.maxSingleFileSizeBytes === -1 && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <InfinityIcon className="size-3" /> Unlimited
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      Maximum size permitted for any single attached file. Enter -1 for unlimited.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="-1"
                        value={
                          policyForm.maxSingleFileSizeBytes === -1
                            ? -1
                            : Math.round(policyForm.maxSingleFileSizeBytes / (1024 * 1024))
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPolicyForm({
                            ...policyForm,
                            maxSingleFileSizeBytes: val === -1 ? -1 : val * 1024 * 1024,
                          });
                        }}
                        className="font-mono text-sm"
                      />
                      <span className="text-xs font-medium text-muted-foreground">MB</span>
                    </div>
                    <div className="flex gap-2">
                      {[10, 25, 50, -1].map((mb) => (
                        <Button
                          key={mb}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setPolicyForm({
                              ...policyForm,
                              maxSingleFileSizeBytes: mb === -1 ? -1 : mb * 1024 * 1024,
                            })
                          }
                        >
                          {mb === -1 ? "Unlimited" : `${mb} MB`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Max Attachment Count */}
                <Card className="border-border/60 relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="size-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">Max Attachment Count</CardTitle>
                      </div>
                      {policyForm.maxAttachmentCount === -1 && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <InfinityIcon className="size-3" /> Unlimited
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      Maximum total files allowed in a single outgoing email. Enter -1 for unlimited.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="-1"
                        value={policyForm.maxAttachmentCount}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            maxAttachmentCount: Number(e.target.value),
                          })
                        }
                        className="font-mono text-sm"
                      />
                      <span className="text-xs font-medium text-muted-foreground">files</span>
                    </div>
                    <div className="flex gap-2">
                      {[5, 10, 20, -1].map((cnt) => (
                        <Button
                          key={cnt}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setPolicyForm({
                              ...policyForm,
                              maxAttachmentCount: cnt,
                            })
                          }
                        >
                          {cnt === -1 ? "Unlimited" : `${cnt}`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* User Storage Quota */}
                <Card className="border-border/60 relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="size-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">User Storage Quota</CardTitle>
                      </div>
                      {policyForm.defaultUserStorageBytes === -1 && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <InfinityIcon className="size-3" /> Unlimited
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      Default combined storage capacity per user for messages and attachments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="-1"
                        value={
                          policyForm.defaultUserStorageBytes === -1
                            ? -1
                            : Math.round(policyForm.defaultUserStorageBytes / (1024 * 1024 * 1024))
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPolicyForm({
                            ...policyForm,
                            defaultUserStorageBytes: val === -1 ? -1 : val * 1024 * 1024 * 1024,
                          });
                        }}
                        className="font-mono text-sm"
                      />
                      <span className="text-xs font-medium text-muted-foreground">GB</span>
                    </div>
                    <div className="flex gap-2">
                      {[5, 10, 50, -1].map((gb) => (
                        <Button
                          key={gb}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setPolicyForm({
                              ...policyForm,
                              defaultUserStorageBytes: gb === -1 ? -1 : gb * 1024 * 1024 * 1024,
                            })
                          }
                        >
                          {gb === -1 ? "Unlimited" : `${gb} GB`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Controls */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Security & Inbound Verification</CardTitle>
                  <CardDescription className="text-xs">
                    Authentication and cryptographic verification policies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Mandatory Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">
                        Require every user to enroll TOTP authenticator or WebAuthn Passkeys upon onboarding.
                      </div>
                    </div>
                    <Switch
                      checked={policyForm.enforceTwoFactor}
                      onCheckedChange={(c) => setPolicyForm({ ...policyForm, enforceTwoFactor: c })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Reject Unverifiable SPF Senders</div>
                      <div className="text-xs text-muted-foreground">
                        Drop incoming messages over Port 25 when SPF lookup fails (HardFail).
                      </div>
                    </div>
                    <Switch
                      checked={policyForm.rejectUnverifiableSpf}
                      onCheckedChange={(c) => setPolicyForm({ ...policyForm, rejectUnverifiableSpf: c })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Reject Invalid DKIM Signatures</div>
                      <div className="text-xs text-muted-foreground">
                        Reject incoming messages with tampered or invalid cryptographic DKIM body signatures.
                      </div>
                    </div>
                    <Switch
                      checked={policyForm.rejectUnverifiableDkim}
                      onCheckedChange={(c) => setPolicyForm({ ...policyForm, rejectUnverifiableDkim: c })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/40 py-3 flex justify-end">
                  <Button onClick={handleSavePolicy} disabled={savingPolicy} className="gap-1.5 text-xs">
                    <Save className="size-3.5" />
                    {savingPolicy ? "Saving Policies..." : "Save Policies & Quotas"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* 3. TEMPLATES & CAMPAIGNS */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Email Templates & Campaigns</h2>
                  <p className="text-sm text-muted-foreground">
                    Create reusable email templates with variable placeholders (e.g. {"{{name}}"}, {"{{company}}"}).
                    Send autonomous personalized campaigns by uploading CSV files or calling our REST API.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowCreateTemplate(true)} className="gap-1.5 text-xs">
                    <Plus className="size-3.5" />
                    New Template
                  </Button>
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tmpl) => (
                  <Card key={tmpl.id} className="border-border/60 hover:border-border transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <FileText className="size-4 text-primary" />
                          {tmpl.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <CardDescription className="text-xs font-mono truncate">
                        Subject: {tmpl.subject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Detected Variables:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tmpl.variables.length > 0 ? (
                            tmpl.variables.map((v) => (
                              <Badge key={v} variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                                {`{{${v}}}`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None (static email)</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded border border-border/40 font-mono text-[11px]">
                        {tmpl.bodyText || tmpl.bodyHtml || "No body content."}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs gap-1.5"
                        onClick={() => {
                          setSelectedCampaignTemplate(tmpl);
                          setShowCampaignModal(true);
                          setCampaignResult(null);
                        }}
                      >
                        <Send className="size-3" />
                        Send Campaign (CSV / API)
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-2 text-center py-12 border border-dashed border-border/60 rounded-xl">
                    <FileText className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium">No templates created yet.</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                      Create templates with placeholders like {"{{name}}"} and {"{{company}}"} to power automated email flows.
                    </p>
                    <Button size="sm" onClick={() => setShowCreateTemplate(true)} className="gap-1.5 text-xs">
                      <Plus className="size-3.5" />
                      Create First Template
                    </Button>
                  </div>
                )}
              </div>

              {/* Developer API Documentation for Templates */}
              <Card className="border-border/60 bg-muted/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Autonomous Template API</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Dispatch personalized autonomous templated emails via API key. Pass variables in a JSON map.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs">
                  <div className="bg-card/80 p-3 rounded-lg border border-border/60 overflow-x-auto text-[11px]">
                    <div className="text-muted-foreground mb-1">// POST /api/rpc/apiKey/sendTemplate</div>
                    <pre className="text-primary-foreground leading-relaxed">{`curl -X POST https://webmail.cellsweb.com/api/rpc/apiKey/sendTemplate \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "${templates[0]?.id || "<TEMPLATE_ID>"}",
    "recipients": [
      {
        "to": "alice@customer.com",
        "variables": { "name": "Alice", "company": "Acme Corp" }
      },
      {
        "to": "bob@partner.org",
        "variables": { "name": "Bob", "company": "Global Tech" }
      }
    ]
  }'`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 4. DOMAINS */}
          {activeTab === "domains" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Custom Domains & DNS</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect domains with automated 2048-bit DKIM keys and SPF verification.
                  </p>
                </div>
                <Link href="/domains/new">
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="size-3.5" />
                    Add Domain
                  </Button>
                </Link>
              </div>

              <Card className="border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>DKIM Selector</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((dom) => (
                      <TableRow key={dom.id}>
                        <TableCell className="font-mono font-medium text-sm">
                          <Link href={`/domains/${dom.id}`} className="hover:underline text-brand-600 dark:text-brand-400">
                            {dom.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={dom.isVerified ? "default" : "outline"} className="text-xs">
                            {dom.isVerified ? "VERIFIED" : "PENDING DNS"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{dom.dkimSelector}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/domains/${dom.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Configure DNS & BIND
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleVerifyDomain(dom.id)}
                          >
                            Verify DNS
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {domains.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                          No domains configured.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* 5. USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Mailbox Users & Quotas</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage mailboxes, storage consumption, and security status.
                  </p>
                </div>
                <Link href="/users/new">
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="size-3.5" />
                    New User
                  </Button>
                </Link>
              </div>

              <Card className="border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Storage Quota</TableHead>
                      <TableHead>2FA Enforced</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-sm">
                          <Link href={`/users/${u.id}`} className="hover:underline text-brand-600 dark:text-brand-400">
                            {u.email}
                          </Link>
                          {u.displayName && <div className="text-xs text-muted-foreground">{u.displayName}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {formatBytes(u.storageUsedBytes || 0)} / {formatBytes(u.storageQuotaBytes || 10737418240)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.twoFactorEnforced ? "default" : "secondary"} className="text-[10px]">
                            {u.twoFactorEnforced ? "YES" : "NO"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === "ACTIVE" ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/users/${u.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Manage User
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* 6. STORAGE BYOS */}
          {activeTab === "storage" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">BYOS S3 / R2 Storage Offload</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your own Cloudflare R2, Amazon S3, or MinIO bucket for large attachment blobs.
                </p>
              </div>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Storage Provider Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Storage Engine</Label>
                    <select
                      value={storageForm.provider}
                      onChange={(e) => setStorageForm({ ...storageForm, provider: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                    >
                      <option value="local_fallback">Local Sovereign Volume (Default)</option>
                      <option value="cloudflare_r2">Cloudflare R2 (Zero Egress)</option>
                      <option value="aws_s3">Amazon Web Services S3</option>
                      <option value="minio">Self-Hosted MinIO</option>
                    </select>
                  </div>

                  {storageForm.provider !== "local_fallback" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Bucket Name</Label>
                          <Input
                            value={storageForm.bucket}
                            onChange={(e) => setStorageForm({ ...storageForm, bucket: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Region</Label>
                          <Input
                            value={storageForm.region}
                            onChange={(e) => setStorageForm({ ...storageForm, region: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Endpoint URL</Label>
                        <Input
                          value={storageForm.endpoint}
                          onChange={(e) => setStorageForm({ ...storageForm, endpoint: e.target.value })}
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Access Key ID</Label>
                          <Input
                            value={storageForm.accessKeyId}
                            onChange={(e) => setStorageForm({ ...storageForm, accessKeyId: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Secret Access Key</Label>
                          <Input
                            type="password"
                            value={storageForm.secretAccessKey}
                            onChange={(e) => setStorageForm({ ...storageForm, secretAccessKey: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {storageTestResult && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        storageTestResult.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {storageTestResult.success ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                      <span>{storageTestResult.message}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/10 border-t border-border/40 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestStorage}
                    disabled={testingStorage || storageForm.provider === "local_fallback"}
                    className="text-xs"
                  >
                    {testingStorage ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button size="sm" onClick={handleSaveStorage} className="text-xs">
                    Save Storage Settings
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* 7. BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">White-Label Branding & Theming</h2>
                <p className="text-sm text-muted-foreground">
                  Apply custom primary colors, logos, and custom webmail domains. Uses dynamic CSS variable injection.
                </p>
              </div>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Branding Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company / Brand Name</Label>
                    <Input
                      value={brandingForm.companyName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Corporation"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary Brand Color (Hex)</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                        className="size-9 rounded cursor-pointer border border-border p-0.5 bg-transparent"
                      />
                      <Input
                        value={brandingForm.primaryColor}
                        onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                        placeholder="#0ea5e9"
                        className="text-xs font-mono w-32"
                      />
                      <div className="flex gap-2">
                        {["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBrandingForm({ ...brandingForm, primaryColor: c })}
                            className="size-6 rounded-full border border-border"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Logo Image URL</Label>
                      <Input
                        value={brandingForm.logoUrl}
                        onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                        placeholder="https://acme.com/logo.png"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Favicon URL</Label>
                      <Input
                        value={brandingForm.faviconUrl}
                        onChange={(e) => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                        placeholder="https://acme.com/favicon.ico"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Custom Webmail Domains</Label>
                    <Input
                      value={brandingForm.customWebmailDomains}
                      onChange={(e) => setBrandingForm({ ...brandingForm, customWebmailDomains: e.target.value })}
                      placeholder="e.g. mail.acme.com, webmail.acme.com"
                      className="text-xs font-mono"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/10 border-t border-border/40 py-3">
                  <Button onClick={handleSaveBranding} disabled={savingBranding} className="text-xs">
                    {savingBranding ? "Saving Branding..." : "Save Branding"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* 8. API KEYS */}
          {activeTab === "apikeys" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">SendGrid-Compatible API Keys</h2>
                  <p className="text-sm text-muted-foreground">
                    Generate programmatic Bearer tokens for external sending, transactional notifications, and templates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/api-keys/new">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      Dedicated Page
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setGeneratedSecretKey(null);
                      setNewKeyForm({
                        name: "",
                        allowedDomains: domains.length > 0 ? [domains[0].name] : ["*"],
                        rateLimitPerMinute: 60,
                      });
                      setShowCreateKey(true);
                    }}
                    size="sm"
                    className="gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer shadow-sm"
                  >
                    <Plus className="size-4" />
                    Generate API Key
                  </Button>
                </div>
              </div>

              <Card className="border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Name</TableHead>
                      <TableHead>Key Prefix</TableHead>
                      <TableHead>Allowed Domains</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium text-sm">{k.name}</TableCell>
                        <TableCell className="font-mono text-xs">{k.keyPrefix}••••••••</TableCell>
                        <TableCell className="font-mono text-xs">
                          {k.allowedDomains.includes("*") ? "All domains (*)" : k.allowedDomains.join(", ")}
                        </TableCell>
                        <TableCell className="text-xs">{k.rateLimitPerMinute} req/min</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 px-2 cursor-pointer"
                            title="Revoke API Key"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {apiKeys.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-3 rounded-full bg-brand-500/10 text-brand-500">
                              <Key className="size-8" />
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-sm text-foreground">No programmatic API keys enrolled</p>
                              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                Generate a SendGrid v3 compatible API key to send transactional emails via REST or SMTP relay.
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                setGeneratedSecretKey(null);
                                setNewKeyForm({
                                  name: "",
                                  allowedDomains: domains.length > 0 ? [domains[0].name] : ["*"],
                                  rateLimitPerMinute: 60,
                                });
                                setShowCreateKey(true);
                              }}
                              size="sm"
                              className="mt-2 gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer shadow-sm"
                            >
                              <Plus className="size-4" />
                              Generate API Key
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </main>
      </div>
      </div>

      {/* CREATE TEMPLATE MODAL */}
      {showCreateTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Create Email Template
              </CardTitle>
              <CardDescription className="text-xs">
                Use curly braces for variable placeholders, e.g. {"{{name}}"}, {"{{company}}"}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTemplate}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Template Name</Label>
                  <Input
                    required
                    value={newTemplateForm.name}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                    placeholder="e.g. Customer Welcome"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subject Line (supports variables)</Label>
                  <Input
                    required
                    value={newTemplateForm.subject}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, subject: e.target.value })}
                    placeholder="Welcome to {{company}}, {{name}}!"
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Body Text (Plaintext fallback)</Label>
                  <Textarea
                    rows={4}
                    value={newTemplateForm.bodyText}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, bodyText: e.target.value })}
                    placeholder="Hello {{name}}, welcome to {{company}}!"
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Body HTML</Label>
                  <Textarea
                    rows={4}
                    value={newTemplateForm.bodyHtml}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, bodyHtml: e.target.value })}
                    placeholder="<p>Hello <strong>{{name}}</strong>, welcome to {{company}}!</p>"
                    className="text-xs font-mono"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateTemplate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creatingTemplate}>
                  {creatingTemplate ? "Saving..." : "Create Template"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* SEND CAMPAIGN / AUTONOMOUS BATCH MODAL */}
      {showCampaignModal && selectedCampaignTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-border bg-card shadow-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="size-4 text-primary" />
                  Dispatch Autonomous Campaign: {selectedCampaignTemplate.name}
                </CardTitle>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowCampaignModal(false)}>
                  ✕
                </Button>
              </div>
              <CardDescription className="text-xs">
                Upload a CSV file containing an "email" column and headers matching template variables:{" "}
                {selectedCampaignTemplate.variables.map((v) => `{{${v}}}`).join(", ") || "(none)"}.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 overflow-y-auto flex-1">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-xs font-medium">Upload Contacts CSV</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                  File should have headers matching your variables: email, name, company...
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleCsvFileUpload(e.target.files[0]);
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                />
              </div>

              {/* Parsed Recipients Preview */}
              {parsedCsvRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{parsedCsvRows.length} Recipients Parsed</span>
                    <span className="text-muted-foreground text-[11px]">Ready for automated delivery</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-border/60 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Recipient Email</TableHead>
                          <TableHead className="text-xs">Variables Map</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedCsvRows.slice(0, 10).map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{row.to}</TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {JSON.stringify(row.variables)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedCsvRows.length > 10 && (
                    <div className="text-[11px] text-muted-foreground text-center">
                      ...and {parsedCsvRows.length - 10} more recipients
                    </div>
                  )}
                </div>
              )}

              {/* Campaign Result Feedback */}
              {campaignResult && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    Campaign Dispatched Successfully!
                  </div>
                  <div className="text-muted-foreground">
                    Total: {campaignResult.total} | Sent: {campaignResult.sent} | Failed: {campaignResult.failed}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="shrink-0 flex justify-between border-t border-border/40 py-3">
              <Button variant="ghost" size="sm" onClick={() => setShowCampaignModal(false)} className="text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={handleDispatchCampaign}
                disabled={dispatchingCampaign || parsedCsvRows.length === 0}
                className="gap-1.5 text-xs"
              >
                <Send className="size-3" />
                {dispatchingCampaign ? "Dispatching..." : `Send to ${parsedCsvRows.length} Recipients`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddDomain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Add Custom Domain</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddDomain}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Domain FQDN</Label>
                  <Input
                    required
                    value={newDomainName}
                    onChange={(e) => setNewDomainName(e.target.value)}
                    placeholder="e.g. acme.com"
                    className="text-xs font-mono"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddDomain(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Domain
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Create Mailbox User</CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateUser}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@acme.com"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Display Name</Label>
                  <Input
                    value={newUserDisplayName}
                    onChange={(e) => setNewUserDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                  >
                    <option value="MAILBOX_USER">Mailbox User</option>
                    <option value="ORG_ADMIN">Organization Administrator</option>
                  </select>
                </div>
                {createdUserCreds && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-emerald-500">User Created Successfully!</div>
                    <div>Email: <span className="font-mono">{createdUserCreds.email}</span></div>
                    <div>Temporary Password: <span className="font-mono font-bold">{createdUserCreds.tempPass}</span></div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddUser(false); setCreatedUserCreds(null); }}>
                  Close
                </Button>
                <Button type="submit" size="sm">
                  Create User
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
      {/* CREATE API KEY MODAL */}
      {showCreateKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="size-4 text-primary" />
                {generatedSecretKey ? "API Key Generated Successfully" : "Generate SendGrid-Compatible API Key"}
              </CardTitle>
              <CardDescription className="text-xs">
                {generatedSecretKey
                  ? "Make sure to copy your API key now. For security reasons, it cannot be displayed again."
                  : "Provision a cryptographically secure Bearer token for transactional mailing, webhooks, and SMTP relay."}
              </CardDescription>
            </CardHeader>
            {generatedSecretKey ? (
              <CardContent className="space-y-4">
                <div className="p-3 bg-brand-50/50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-lg space-y-2">
                  <Label className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Your Secret API Key
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={generatedSecretKey}
                      className="font-mono text-xs bg-background select-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSecretKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="gap-1.5 shrink-0"
                    >
                      {copiedKey ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      <span>{copiedKey ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Example cURL Usage (SendGrid compatible):</Label>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto">
{`curl -X POST https://webmail.cellsweb.com/rpc \\
  -H "Authorization: Bearer ${generatedSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"namespace":"apiKey","functionName":"send","data":{"to":["recipient@example.com"],"subject":"Hello","text":"Hi from API"}}'`}
                  </pre>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Key Name *</Label>
                    <Input
                      required
                      value={newKeyForm.name}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                      placeholder="e.g. Production Webhook Mailer"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Allowed Sender Domain(s)</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewKeyForm({
                          ...newKeyForm,
                          allowedDomains: val === "*" ? ["*"] : [val],
                        });
                      }}
                    >
                      <option value="*">All Verified Domains (*)</option>
                      {domains.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Rate Limit (requests / minute)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={newKeyForm.rateLimitPerMinute}
                      onChange={(e) =>
                        setNewKeyForm({
                          ...newKeyForm,
                          rateLimitPerMinute: parseInt(e.target.value) || 60,
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateKey(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creatingKey || !newKeyForm.name.trim()}
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    {creatingKey ? "Generating..." : "Generate Key"}
                  </Button>
                </CardFooter>
              </form>
            )}

            {generatedSecretKey && (
              <CardFooter className="flex justify-end border-t border-border/40 pt-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowCreateKey(false);
                    setGeneratedSecretKey(null);
                  }}
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                >
                  Done
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
