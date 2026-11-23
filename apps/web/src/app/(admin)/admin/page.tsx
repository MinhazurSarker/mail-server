"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall, API_BASE_URL } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

interface AdminOverview {
  organizationName: string;
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
  createdAt: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  lastUsedAt?: string;
  createdAt: string;
}

interface StorageConfigData {
  provider: string;
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
}

interface SesBackupData {
  enabled: boolean;
  region: string;
  accessKeyId?: string;
  fromEmail?: string;
}

interface PolicyData {
  enforceTwoFactor: boolean;
  spamThresholdScore: number;
  rejectUnverifiableSpf: boolean;
  rejectUnverifiableDkim: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "domains" | "users" | "apikeys" | "storage" | "ses" | "policies" | "branding">("overview");

  // State data
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [storageConfig, setStorageConfig] = useState<StorageConfigData | null>(null);
  const [sesBackup, setSesBackup] = useState<SesBackupData | null>(null);

  // White-Label Branding State
  const [brandingForm, setBrandingForm] = useState({
    companyName: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "",
    customWebmailDomains: "",
  });

  // Policy Form state (ui-sdk switch controls)
  const [policyForm, setPolicyForm] = useState<PolicyData>({
    enforceTwoFactor: true,
    spamThresholdScore: 5,
    rejectUnverifiableSpf: false,
    rejectUnverifiableDkim: false,
  });

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

  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDomains, setNewKeyDomains] = useState("*");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(60);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  // Code snippet language tab
  const [codeLang, setCodeLang] = useState<"curl" | "node" | "python">("curl");

  // Form states
  const [storageForm, setStorageForm] = useState({
    provider: "local_fallback",
    endpoint: "https://<account-id>.r2.cloudflarestorage.com",
    bucket: "cellsinbox-blobs",
    region: "auto",
    accessKeyId: "",
    secretAccessKey: "",
  });

  const [sesForm, setSesForm] = useState({
    enabled: false,
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: "",
    fromEmail: "",
  });

  const [testingStorage, setTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const handleTestStorageConnection = async () => {
    setTestingStorage(true);
    setStorageTestResult(null);
    try {
      const res = await rpcCall<{ success: boolean; message: string; latencyMs?: number }>(
        "admin",
        "storageTest",
        storageForm,
      );
      setStorageTestResult(res);
    } catch (err: any) {
      setStorageTestResult({
        success: false,
        message: err.message || "Failed to reach storage provider.",
      });
    } finally {
      setTestingStorage(false);
    }
  };

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const saveHint = "⌘S";

  const loadAllData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        rpcCall<AdminOverview>("admin", "overview", {}),
        rpcCall<{ items: DomainItem[] }>("admin", "domainsList", {}),
        rpcCall<{ items: UserItem[] }>("admin", "usersList", {}),
        rpcCall<{ items: ApiKeyItem[] }>("apiKey", "list", {}),
        rpcCall<StorageConfigData>("admin", "storageGet", {}),
        rpcCall<SesBackupData>("admin", "sesBackupGet", {}),
        rpcCall<PolicyData>("admin", "policyGet", {}),
        rpcCall<{
          logoUrl?: string;
          faviconUrl?: string;
          companyName?: string;
          primaryColor?: string;
          customWebmailDomains?: string[];
        }>("admin", "branding-get", {}),
      ]);

      const [ovRes, domRes, usrRes, keyRes, storRes, sesRes, polRes, brandRes] = results;

      if (ovRes.status === "fulfilled") setOverview(ovRes.value);
      if (domRes.status === "fulfilled") setDomains(domRes.value.items || []);
      if (usrRes.status === "fulfilled") setUsers(usrRes.value.items || []);
      if (keyRes.status === "fulfilled") setApiKeys(keyRes.value.items || []);
      if (storRes.status === "fulfilled") {
        setStorageConfig(storRes.value);
        if (storRes.value.provider) {
          setStorageForm((prev) => ({
            ...prev,
            provider: storRes.value.provider,
            endpoint: storRes.value.endpoint || prev.endpoint,
            bucket: storRes.value.bucket || prev.bucket,
            region: storRes.value.region || prev.region,
          }));
        }
      }
      if (sesRes.status === "fulfilled" && sesRes.value) {
        setSesBackup(sesRes.value);
        setSesForm((prev) => ({
          ...prev,
          enabled: sesRes.value.enabled,
          region: sesRes.value.region || "us-east-1",
          fromEmail: sesRes.value.fromEmail || "",
        }));
      }
      if (polRes.status === "fulfilled" && polRes.value) {
        setPolicyForm(polRes.value);
      }
      if (brandRes.status === "fulfilled" && brandRes.value) {
        setBrandingForm({
          companyName: brandRes.value.companyName || "",
          logoUrl: brandRes.value.logoUrl || "",
          faviconUrl: brandRes.value.faviconUrl || "",
          primaryColor: brandRes.value.primaryColor || "",
          customWebmailDomains: (brandRes.value.customWebmailDomains || []).join(", "),
        });
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    rpcCall<UserProfile>("auth", "me", {})
      .then((u) => {
        if (u.role !== "ORG_ADMIN" && u.role !== "PLATFORM_ADMIN") {
          router.push("/inbox");
          return;
        }
        setUser(u);
        loadAllData();
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router, loadAllData]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;
    try {
      const res = await rpcCall<{ domain: any }>("admin", "domainAdd", { name: newDomainName });
      setDomainDnsDetails(res.domain);
      loadAllData();
      showToast(`Domain '${newDomainName}' registered! Please configure DNS records.`);
    } catch (err: any) {
      alert("Error adding domain: " + err.message);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const res = await rpcCall<any>("admin", "domainVerify", { domainId });
      loadAllData();
      showToast(
        res.isVerified
          ? "Domain DNS verified successfully!"
          : "Verification check completed. Some DNS records are still propagating.",
      );
    } catch (err: any) {
      alert("Error verifying domain: " + err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserDomainId) return;
    try {
      const res = await rpcCall<any>("admin", "userCreate", {
        domainId: newUserDomainId,
        email: newUserEmail,
        displayName: newUserDisplayName,
        role: newUserRole,
      });
      setCreatedUserCreds({ email: res.user.email, tempPass: res.temporaryPassword });
      loadAllData();
      showToast(`Mailbox account created for ${res.user.email}`);
    } catch (err: any) {
      alert("Error creating user: " + err.message);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const domainsArr = newKeyDomains.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await rpcCall<any>("apiKey", "create", {
        name: newKeyName,
        allowedDomains: domainsArr.length > 0 ? domainsArr : ["*"],
        rateLimitPerMinute: Number(newKeyRateLimit) || 60,
      });
      setRevealedKey(res.rawSecretKey);
      setShowAddKey(false);
      loadAllData();
      showToast("API Key created! Copy the secret now.");
    } catch (err: any) {
      alert("Error creating API key: " + err.message);
    }
  };

  const handleRevokeApiKey = async (apiKeyId: string) => {
    if (!confirm("Are you sure you want to permanently revoke this API key? Applications using it will stop sending.")) return;
    try {
      await rpcCall("apiKey", "revoke", { apiKeyId });
      loadAllData();
      showToast("API key revoked");
    } catch (err: any) {
      alert("Error revoking API key: " + err.message);
    }
  };

  const handleSaveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rpcCall("admin", "storageUpdate", storageForm);
      loadAllData();
      showToast("Storage configuration verified and saved!");
    } catch (err: any) {
      alert("Storage error: " + err.message);
    }
  };

  const handleSaveSes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rpcCall("admin", "sesBackupUpdate", sesForm);
      loadAllData();
      showToast("Secondary Amazon SES connector saved!");
    } catch (err: any) {
      alert("SES update error: " + err.message);
    }
  };

  const handleSavePolicy = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSavingPolicy(true);
    try {
      await rpcCall("admin", "policyUpdate", policyForm);
      loadAllData();
      showToast("Organization security policies updated successfully!");
    } catch (err: any) {
      alert("Policy update error: " + err.message);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleSaveBranding = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSavingBranding(true);
    try {
      const domains = brandingForm.customWebmailDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      await rpcCall("admin", "branding-update", {
        companyName: brandingForm.companyName.trim() || undefined,
        logoUrl: brandingForm.logoUrl.trim() || undefined,
        faviconUrl: brandingForm.faviconUrl.trim() || undefined,
        primaryColor: brandingForm.primaryColor.trim() || undefined,
        customWebmailDomains: domains,
      });
      loadAllData();
      showToast("White-label branding & custom CNAME domains saved successfully!");
    } catch (err: any) {
      alert("Branding update error: " + err.message);
    } finally {
      setSavingBranding(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        if (activeTab === "policies") {
          e.preventDefault();
          handleSavePolicy();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, policyForm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Loading Administration Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── HEADER ── */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="size-3.5" />
              Back to Mail
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="font-bold text-base tracking-tight">Organization Governance</h1>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium border-border/80">
            {overview?.organizationName || "CellsInbox"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold block">{user?.email}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Server },
            { id: "domains", label: "Domains & DNS", icon: Globe, count: domains.length },
            { id: "users", label: "Mailbox Accounts", icon: Users, count: users.length },
            { id: "apikeys", label: "SendGrid API Keys", icon: Key, count: apiKeys.length },
            { id: "policies", label: "Security & Policies", icon: Sliders },
            { id: "branding", label: "White-Label & Branding", icon: Palette },
            { id: "storage", label: "BYOS Storage", icon: HardDrive },
            { id: "ses", label: "Amazon SES Backup", icon: Cloud, badge: sesBackup?.enabled ? "Active" : undefined },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-8 gap-2 text-xs font-medium ${isActive ? "font-semibold shadow-xs" : ""}`}
              >
                <IconComp className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px] ml-0.5">
                    {tab.count}
                  </Badge>
                )}
                {tab.badge && (
                  <Badge variant="default" className="h-4 px-1 text-[9px] bg-emerald-600 ml-0.5">
                    {tab.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Configured Domains</CardDescription>
                  <CardTitle className="text-2xl font-bold">{overview?.domainsCount ?? 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span>SPF, DKIM 2048-bit, DMARC, MX</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Mailbox Accounts</CardDescription>
                  <CardTitle className="text-2xl font-bold">{overview?.usersCount ?? 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="size-3 text-primary" />
                    <span>WebAuthn / TOTP 2FA Enforced</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Outbound MTA Delivery</CardDescription>
                  <CardTitle className="text-2xl font-bold text-emerald-500">Active (Port 25)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="size-3 text-emerald-500" />
                    <span>Direct-to-MX Sovereign Routing</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Secondary Failover</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {overview?.sesBackupEnabled ? (
                      <span className="text-emerald-500">Enabled</span>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Cloud className="size-3 text-primary" />
                    <span>Amazon SES Backup Connector</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  Sovereign Privacy Boundary Guarantee
                </CardTitle>
                <CardDescription>
                  Architectural privacy enforcement between platform super-admin, organization admin, and mailbox users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  1. <strong className="text-foreground">Super Admin Blindness:</strong> Super-administrators can view system quotas, server health, and storage utilization, but have strict zero-knowledge access to message contents or user inboxes.
                </p>
                <p>
                  2. <strong className="text-foreground">Sovereign Direct-to-MX MTA:</strong> Outbound emails are signed with an RSA-SHA256 2048-bit key (`s=ci`) and delivered directly to the target mailbox server over Port 25 STARTTLS without third-party transit.
                </p>
                <p>
                  3. <strong className="text-foreground">Autonomous Secondary Failover:</strong> If destination servers block Port 25 or network timeouts occur, the MTA queue gracefully fails over to the configured secondary Amazon SES connector.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 2: DOMAINS & DNS ── */}
        {activeTab === "domains" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Organization Domains</h2>
                <p className="text-xs text-muted-foreground">
                  Connect email domains with automatic 2048-bit DKIM keypair generation and MX/SPF verification.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddDomain(true)} className="gap-1.5 h-8 text-xs font-semibold">
                <Plus className="size-3.5" />
                Add Domain
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MX</TableHead>
                    <TableHead>SPF</TableHead>
                    <TableHead>DKIM</TableHead>
                    <TableHead>DMARC</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                        No domains configured yet. Add your first domain to begin receiving mail.
                      </TableCell>
                    </TableRow>
                  ) : (
                    domains.map((dom) => (
                      <TableRow key={dom.id}>
                        <TableCell className="font-semibold text-xs">{dom.name}</TableCell>
                        <TableCell>
                          {dom.isVerified ? (
                            <Badge variant="default" className="bg-emerald-600 text-[10px] h-5">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-[10px] h-5">Pending DNS</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{dom.mxStatus}</TableCell>
                        <TableCell className="text-xs">{dom.spfStatus}</TableCell>
                        <TableCell className="text-xs">{dom.dkimStatus}</TableCell>
                        <TableCell className="text-xs">{dom.dmarcStatus}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setDomainDnsDetails(dom)}
                              className="h-7 text-xs"
                            >
                              View DNS
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleVerifyDomain(dom.id)}
                              className="gap-1 h-7 text-xs"
                            >
                              <RefreshCw className="size-3" />
                              Verify DNS
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* DNS Modal */}
            {domainDnsDetails && (
              <Card className="border-primary/50 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-primary">DNS Records for {domainDnsDetails.name}</CardTitle>
                      <CardDescription>
                        Configure these DNS records at your domain registrar or DNS provider.
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="xs" onClick={() => setDomainDnsDetails(null)}>✕</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-muted/40 rounded-md space-y-1">
                    <span className="text-muted-foreground font-sans font-semibold text-[11px] block">MX Record (Inbound Mail Routing)</span>
                    <p className="select-all">Type: MX | Priority: 10 | Host: @ | Value: mail.cellsweb.com</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md space-y-1">
                    <span className="text-muted-foreground font-sans font-semibold text-[11px] block">TXT SPF Record (Sender Authorization)</span>
                    <p className="select-all">Type: TXT | Host: @ | Value: v=spf1 mx ~all</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md space-y-1">
                    <span className="text-muted-foreground font-sans font-semibold text-[11px] block">TXT DKIM Record (2048-bit RSA Signing)</span>
                    <p className="select-all break-all">Type: TXT | Host: {domainDnsDetails.dkimSelector}._domainkey | Value: v=DKIM1; k=rsa; p={domainDnsDetails.dkimPublicKey}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md space-y-1">
                    <span className="text-muted-foreground font-sans font-semibold text-[11px] block">TXT DMARC Policy (Security & Alignment)</span>
                    <p className="select-all">Type: TXT | Host: _dmarc | Value: v=DMARC1; p=reject; rua=mailto:postmaster@cellsweb.com;</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md space-y-1">
                    <span className="text-muted-foreground font-sans font-semibold text-[11px] block">CNAME Webmail (White-Label Portal)</span>
                    <p className="select-all">Type: CNAME | Host: webmail | Value: webmail.cellsweb.com</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Domain Card Dialog */}
            {showAddDomain && (
              <Card className="border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Register New Domain</CardTitle>
                  <CardDescription>Add a fully qualified domain name to generate sovereign cryptographic signing keys.</CardDescription>
                </CardHeader>
                <form onSubmit={handleAddDomain}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domainName">Domain Name</Label>
                      <Input
                        id="domainName"
                        type="text"
                        placeholder="example.com"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDomain(false)}>Cancel</Button>
                    <Button type="submit" size="sm">Register & Generate Keys</Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB 3: USERS ── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Mailbox Accounts</h2>
                <p className="text-xs text-muted-foreground">Manage user mailboxes and enforce multi-factor security onboarding.</p>
              </div>
              <Button size="sm" onClick={() => setShowAddUser(true)} className="gap-1.5 h-8 text-xs font-semibold">
                <Plus className="size-3.5" />
                Create Account
              </Button>
            </div>

            {createdUserCreds && (
              <Card className="border-emerald-500/60 bg-emerald-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="size-4" />
                    Mailbox Account Created Successfully
                  </CardTitle>
                  <CardDescription className="text-emerald-300/80 text-xs">
                    Please provide these initial temporary credentials to the user. They will be prompted for mandatory 2FA onboarding on first login.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs space-y-1.5 font-mono">
                  <p>Email: <span className="font-bold select-all text-foreground">{createdUserCreds.email}</span></p>
                  <p>Temporary Password: <span className="font-bold select-all text-emerald-400">{createdUserCreds.tempPass}</span></p>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    Login Portal: <code className="font-mono text-foreground">{typeof window !== "undefined" ? window.location.origin + "/login" : "/login"}</code>
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => {
                      const portalUrl = typeof window !== "undefined" ? window.location.origin + "/login" : "";
                      navigator.clipboard.writeText(`CellsInbox Mailbox Credentials:\nEmail: ${createdUserCreds.email}\nTemporary Password: ${createdUserCreds.tempPass}\nLogin Portal: ${portalUrl}`);
                      showToast("Credentials and login link copied to clipboard!");
                    }}
                    className="gap-1"
                  >
                    <Copy className="size-3" />
                    Copy Credentials & Login Link
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => setCreatedUserCreds(null)}>Dismiss</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>2FA Enforced</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-xs">{u.email}</TableCell>
                      <TableCell className="text-xs">{u.displayName || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "ORG_ADMIN" ? "default" : "secondary"} className="text-[10px] h-5">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] h-5">{u.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {u.twoFactorEnforced ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Enforced
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Add User Modal */}
            {showAddUser && (
              <Card className="border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Create Mailbox User</CardTitle>
                  <CardDescription>Assign an email address under your verified organization domains.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateUser}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newUserDomain">Select Domain</Label>
                        <select
                          id="newUserDomain"
                          value={newUserDomainId}
                          onChange={(e) => setNewUserDomainId(e.target.value)}
                          required
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">-- Choose domain --</option>
                          {domains.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newUserEmail">Account Email</Label>
                        <Input
                          id="newUserEmail"
                          type="email"
                          placeholder="alice@example.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newUserDisplay">Display Name</Label>
                        <Input
                          id="newUserDisplay"
                          type="text"
                          placeholder="Alice Smith"
                          value={newUserDisplayName}
                          onChange={(e) => setNewUserDisplayName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newUserRole">Access Role</Label>
                        <select
                          id="newUserRole"
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="MAILBOX_USER">Mailbox User</option>
                          <option value="ORG_ADMIN">Organization Admin</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddUser(false)}>Cancel</Button>
                    <Button type="submit" size="sm">Create Account</Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB 4: API KEYS & DEVELOPER CONNECTORS ── */}
        {activeTab === "apikeys" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold tracking-tight">SendGrid-Compatible API Keys</h2>
                <p className="text-xs text-muted-foreground">
                  Generate programmatic credentials for transactional sending. Drop-in replacement for SendGrid `/v3/mail/send`.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddKey(true)} className="gap-1.5 h-8 text-xs font-semibold">
                <Plus className="size-3.5" />
                Generate API Key
              </Button>
            </div>

            {revealedKey && (
              <Card className="border-amber-500/60 bg-amber-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    Copy Your Live API Key Now
                  </CardTitle>
                  <CardDescription className="text-amber-300/80 text-xs">
                    This secret is hashed with Argon2id and will never be displayed again.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-background/80 rounded-md font-mono text-xs font-bold text-amber-400 break-all select-all border border-amber-500/40">
                    {revealedKey}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="xs" onClick={() => setRevealedKey(null)}>Dismiss</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Allowed Domains</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        No API keys configured yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiKeys.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-semibold text-xs">{k.name}</TableCell>
                        <TableCell className="font-mono text-xs">{k.keyPrefix}••••••••</TableCell>
                        <TableCell className="text-xs">{k.allowedDomains.join(", ")}</TableCell>
                        <TableCell className="text-xs">{k.rateLimitPerMinute} req/min</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => handleRevokeApiKey(k.id)}
                            className="gap-1 h-7 text-xs"
                          >
                            <Trash2 className="size-3" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Developer Code Snippets */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Code className="size-4 text-primary" />
                    <CardTitle className="text-sm">Developer Code Connectors (SendGrid Drop-In)</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {(["curl", "node", "python"] as const).map((lang) => (
                      <Button
                        key={lang}
                        variant={codeLang === lang ? "secondary" : "ghost"}
                        size="xs"
                        onClick={() => setCodeLang(lang)}
                        className="text-xs h-6 px-2.5 uppercase"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-md bg-muted/40 font-mono text-xs overflow-x-auto text-foreground/90 leading-relaxed border border-border/50">
                  {codeLang === "curl" && `curl -X POST ${API_BASE_URL}/v3/mail/send \\
  -H "Authorization: Bearer ci_live_YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "personalizations": [{ "to": [{ "email": "recipient@example.com" }] }],
    "from": { "email": "notifications@yourdomain.com", "name": "App Alerts" },
    "subject": "Order Confirmation #1042",
    "content": [{ "type": "text/html", "value": "<h1>Thanks for your order!</h1>" }]
  }'`}

                  {codeLang === "node" && `import sgMail from '@sendgrid/mail';

sgMail.setApiKey('ci_live_YOUR_SECRET_KEY');
// Set custom sovereign endpoint:
(sgMail as any).client.setDefaultRequest('baseUrl', '${API_BASE_URL}');

await sgMail.send({
  to: 'recipient@example.com',
  from: 'notifications@yourdomain.com',
  subject: 'Order Confirmation #1042',
  html: '<h1>Thanks for your order!</h1>',
});`}

                  {codeLang === "python" && `from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='notifications@yourdomain.com',
    to_emails='recipient@example.com',
    subject='Order Confirmation #1042',
    html_content='<h1>Thanks for your order!</h1>'
)

sg = SendGridAPIClient('ci_live_YOUR_SECRET_KEY')
sg.client.host = '${API_BASE_URL}'
response = sg.send(message)
print(response.status_code) # 202`}
                </pre>
              </CardContent>
            </Card>

            {/* Create API Key Modal */}
            {showAddKey && (
              <Card className="border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Create SendGrid-Style API Key</CardTitle>
                  <CardDescription>Domain-restricted API keys for transactional application delivery.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateApiKey}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Description Name</Label>
                      <Input
                        id="keyName"
                        type="text"
                        placeholder="Production Web Backend"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyDomains">Allowed Sender Domains (* for all)</Label>
                        <Input
                          id="keyDomains"
                          type="text"
                          value={newKeyDomains}
                          onChange={(e) => setNewKeyDomains(e.target.value)}
                          placeholder="example.com, alerts.example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keyLimit">Rate Limit (Requests / Minute)</Label>
                        <Input
                          id="keyLimit"
                          type="number"
                          value={newKeyRateLimit}
                          onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                          min={1}
                          max={10000}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddKey(false)}>Cancel</Button>
                    <Button type="submit" size="sm">Create Secret Key</Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB 5: SECURITY POLICIES & GOVERNANCE (UI-SDK CONTROLS) ── */}
        {activeTab === "policies" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Organization Security & Inbound Policies</h2>
                <p className="text-xs text-muted-foreground">
                  Governance rules enforced for mailboxes, anti-spam validation, and recipient verification.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleSavePolicy()}
                disabled={savingPolicy}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Save className="size-3.5" />
                {savingPolicy ? "Saving..." : "Save Policies"}
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px] font-mono">
                  {saveHint}
                </kbd>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Authentication & Onboarding Controls
                </CardTitle>
                <CardDescription>
                  Protect tenant access across all employee accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 2FA Enforcement */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="enforce-2fa" className="text-xs font-semibold text-foreground cursor-pointer">
                      Mandatory Two-Factor (2FA) Onboarding
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Require all new mailbox accounts to configure RFC 6238 TOTP authenticators before receiving or viewing email.
                    </p>
                  </div>
                  <Switch
                    id="enforce-2fa"
                    checked={policyForm.enforceTwoFactor}
                    onCheckedChange={(checked) => setPolicyForm({ ...policyForm, enforceTwoFactor: !!checked })}
                  />
                </div>

                {/* Reject unverifiable SPF */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="reject-spf" className="text-xs font-semibold text-foreground cursor-pointer">
                      Reject Inbound SPF Hard-Failures (-all)
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Drop incoming connections immediately if connecting IP fails sender SPF check.
                    </p>
                  </div>
                  <Switch
                    id="reject-spf"
                    checked={policyForm.rejectUnverifiableSpf}
                    onCheckedChange={(checked) => setPolicyForm({ ...policyForm, rejectUnverifiableSpf: !!checked })}
                  />
                </div>

                {/* Reject unverifiable DKIM */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="reject-dkim" className="text-xs font-semibold text-foreground cursor-pointer">
                      Strict DKIM Signature Quarantine
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically flag incoming messages with broken or forged DKIM signatures to Junk folder.
                    </p>
                  </div>
                  <Switch
                    id="reject-dkim"
                    checked={policyForm.rejectUnverifiableDkim}
                    onCheckedChange={(checked) => setPolicyForm({ ...policyForm, rejectUnverifiableDkim: !!checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Inbound Spam Scoring Threshold
                </CardTitle>
                <CardDescription>
                  Messages scoring above this threshold are quarantined or rejected. (Default: 5.0)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="spamThreshold">Spam Score Threshold (1 - 10)</Label>
                  <Input
                    id="spamThreshold"
                    type="number"
                    min={1}
                    max={10}
                    step={0.5}
                    value={policyForm.spamThresholdScore}
                    onChange={(e) => setPolicyForm({ ...policyForm, spamThresholdScore: Number(e.target.value) })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower values increase filtering strictness; higher values reduce false positives.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB: WHITE-LABEL BRANDING & CNAME ── */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="size-4 text-primary" />
                  White-Label Branding & Custom Webmail CNAME
                </CardTitle>
                <CardDescription>
                  Configure your organization's custom branding. Users visiting via your custom CNAME webmail domain will see your company logo, name, and styling.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveBranding}>
                <CardContent className="space-y-6">
                  {/* CNAME Instruction Alert */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Globe className="size-4" />
                      <span>How Custom CNAME Webmail Works</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Point a DNS <span className="font-mono font-semibold text-foreground">CNAME</span> record from your custom domain to your webmail host:
                      <br />
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-[11px] block mt-1.5 w-fit border border-border/80">
                        webmail.yourcompany.com CNAME webmail.cellsweb.com
                      </span>
                      When users navigate to your custom CNAME, CellsInbox resolves the host, loads your organization's custom logo, and customizes the webmail client automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandCompanyName">Company Display Name</Label>
                      <Input
                        id="brandCompanyName"
                        type="text"
                        value={brandingForm.companyName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, companyName: e.target.value })}
                        placeholder={overview?.organizationName || "Acme Corporation"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandPrimaryColor">Primary Brand Color (Hex)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="brandPrimaryColor"
                          type="text"
                          value={brandingForm.primaryColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                          placeholder="#0284c7"
                          className="font-mono"
                        />
                        {brandingForm.primaryColor && (
                          <div
                            className="size-9 rounded border border-border shrink-0 shadow-xs"
                            style={{ backgroundColor: brandingForm.primaryColor }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandLogoUrl">Organization Logo URL</Label>
                      <Input
                        id="brandLogoUrl"
                        type="url"
                        value={brandingForm.logoUrl}
                        onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                        placeholder="https://yourcompany.com/assets/logo.png"
                      />
                      <p className="text-[11px] text-muted-foreground">Recommended: Transparent SVG or PNG, max 240px wide.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandFaviconUrl">Favicon URL (Optional)</Label>
                      <Input
                        id="brandFaviconUrl"
                        type="url"
                        value={brandingForm.faviconUrl}
                        onChange={(e) => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                        placeholder="https://yourcompany.com/favicon.ico"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandCustomDomains">Custom CNAME Webmail Domains</Label>
                    <Input
                      id="brandCustomDomains"
                      type="text"
                      value={brandingForm.customWebmailDomains}
                      onChange={(e) => setBrandingForm({ ...brandingForm, customWebmailDomains: e.target.value })}
                      placeholder="webmail.yourcompany.com, mail.clientcorp.org"
                    />
                    <p className="text-[11px] text-muted-foreground">Comma-separated list of hostnames mapped via CNAME to your webmail endpoint.</p>
                  </div>

                  {/* Live Branding Preview */}
                  <div className="border border-border/80 rounded-lg p-4 bg-muted/20 space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Live Login Preview
                    </span>
                    <div className="p-4 rounded-lg bg-background border border-border max-w-sm mx-auto text-center space-y-2 shadow-xs">
                      {brandingForm.logoUrl ? (
                        <img
                          src={brandingForm.logoUrl}
                          alt="Company Logo Preview"
                          className="h-8 max-w-[180px] object-contain mx-auto"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xs font-bold">
                          {(brandingForm.companyName || overview?.organizationName || "C")[0].toUpperCase()}
                        </div>
                      )}
                      <h4 className="font-bold text-sm">
                        {brandingForm.companyName || overview?.organizationName || "CellsInbox"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Sign in to your {brandingForm.companyName || overview?.organizationName || "sovereign"} mailbox
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-2 border-t border-border/60">
                  <Button type="submit" disabled={savingBranding} size="sm" className="gap-2">
                    {savingBranding ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save White-Label Branding
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* ── TAB 6: BYOS STORAGE ── */}
        {activeTab === "storage" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                BYOS S3 / R2 Attachment Storage Configuration
              </CardTitle>
              <CardDescription>
                Connect your sovereign Cloudflare R2, AWS S3, or MinIO bucket. Raw email payloads and attachments are offloaded here directly.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveStorage}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storageProvider">Storage Provider</Label>
                    <select
                      id="storageProvider"
                      value={storageForm.provider}
                      onChange={(e) => setStorageForm({ ...storageForm, provider: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="local_fallback">Local Storage Fallback (./storage/blobs)</option>
                      <option value="cloudflare_r2">Cloudflare R2 Storage (S3 Compatible)</option>
                      <option value="aws_s3">Amazon AWS S3</option>
                      <option value="minio">MinIO Self-Hosted</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storageBucket">Bucket Name</Label>
                    <Input
                      id="storageBucket"
                      type="text"
                      value={storageForm.bucket}
                      onChange={(e) => setStorageForm({ ...storageForm, bucket: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storageEndpoint">S3 Endpoint URL</Label>
                    <Input
                      id="storageEndpoint"
                      type="text"
                      value={storageForm.endpoint}
                      onChange={(e) => setStorageForm({ ...storageForm, endpoint: e.target.value })}
                      placeholder="https://<account-id>.r2.cloudflarestorage.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storageRegion">Region</Label>
                    <Input
                      id="storageRegion"
                      type="text"
                      value={storageForm.region}
                      onChange={(e) => setStorageForm({ ...storageForm, region: e.target.value })}
                      placeholder="auto or us-east-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storageAccessKey">Access Key ID</Label>
                    <Input
                      id="storageAccessKey"
                      type="text"
                      value={storageForm.accessKeyId}
                      onChange={(e) => setStorageForm({ ...storageForm, accessKeyId: e.target.value })}
                      placeholder="Leave unchanged to keep existing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storageSecretKey">Secret Access Key</Label>
                    <Input
                      id="storageSecretKey"
                      type="password"
                      value={storageForm.secretAccessKey}
                      onChange={(e) => setStorageForm({ ...storageForm, secretAccessKey: e.target.value })}
                      placeholder="Leave unchanged to keep existing"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingStorage}
                    onClick={handleTestStorageConnection}
                    className="gap-1.5 h-8 text-xs font-semibold"
                  >
                    <RefreshCw className={`size-3.5 ${testingStorage ? "animate-spin" : ""}`} />
                    {testingStorage ? "Testing Ping..." : "Test Live Connection"}
                  </Button>
                  {storageTestResult && (
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${
                      storageTestResult.success ? "text-emerald-500" : "text-destructive"
                    }`}>
                      {storageTestResult.success ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                      {storageTestResult.message}
                      {storageTestResult.latencyMs !== undefined && ` (${storageTestResult.latencyMs}ms)`}
                    </span>
                  )}
                </div>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Save className="size-3.5" />
                  Save Storage Configuration
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── TAB 7: AMAZON SES BACKUP ── */}
        {activeTab === "ses" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="size-4 text-primary" />
                Secondary Amazon SES Backup Connector
              </CardTitle>
              <CardDescription>
                Failover relay connector. When sovereign Port 25 delivery encounters ISP blocks or remote failures, CellsInbox automatically dispatches via Amazon SES.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSes}>
              <CardContent className="space-y-4">
                {/* SES Enable */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="ses-enable" className="text-xs font-semibold text-foreground cursor-pointer">
                      Enable Automatic Amazon SES Outbound Failover
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically route queued emails through AWS SES if sovereign direct Port 25 delivery fails.
                    </p>
                  </div>
                  <Switch
                    id="ses-enable"
                    checked={sesForm.enabled}
                    onCheckedChange={(checked) => setSesForm({ ...sesForm, enabled: !!checked })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sesRegion">AWS Region</Label>
                    <Input
                      id="sesRegion"
                      type="text"
                      value={sesForm.region}
                      onChange={(e) => setSesForm({ ...sesForm, region: e.target.value })}
                      placeholder="us-east-1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sesFromEmail">Verified Sender / Identity Email</Label>
                    <Input
                      id="sesFromEmail"
                      type="email"
                      value={sesForm.fromEmail}
                      onChange={(e) => setSesForm({ ...sesForm, fromEmail: e.target.value })}
                      placeholder="admin@yourdomain.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sesAccessKey">AWS Access Key ID</Label>
                    <Input
                      id="sesAccessKey"
                      type="text"
                      value={sesForm.accessKeyId}
                      onChange={(e) => setSesForm({ ...sesForm, accessKeyId: e.target.value })}
                      placeholder="Leave unchanged to keep existing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sesSecretKey">AWS Secret Access Key</Label>
                    <Input
                      id="sesSecretKey"
                      type="password"
                      value={sesForm.secretAccessKey}
                      onChange={(e) => setSesForm({ ...sesForm, secretAccessKey: e.target.value })}
                      placeholder="Leave unchanged to keep existing"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button type="submit" size="sm">Save SES Connector</Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/50 text-foreground px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
