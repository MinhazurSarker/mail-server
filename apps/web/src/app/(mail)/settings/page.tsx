"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { startRegistration } from "@simplewebauthn/browser";
import { rpcCall } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Shield,
  Sliders,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  Mail,
  HardDrive,
  QrCode,
  Smartphone,
  Fingerprint,
  Trash2,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
  Key,
  AlertCircle,
  RefreshCw,
  Laptop,
} from "lucide-react";

interface UserSettings {
  id: string;
  email: string;
  displayName: string;
  role: string;
  twoFactorEnforced: boolean;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  preferences: {
    signature: string;
    autoSaveDrafts: boolean;
    sendReadReceipts: boolean;
    desktopNotifications: boolean;
    defaultFormat: "html" | "text";
    theme: "dark" | "light" | "system";
  };
}

interface PasskeyItem {
  id: string;
  name: string;
  credentialId: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface SecurityStatus {
  totpEnabled: boolean;
  twoFactorEnforced: boolean;
  passkeys: PasskeyItem[];
}

export default function UserSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security">("profile");

  // Profile Form state
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [storageQuota, setStorageQuota] = useState(10 * 1024 * 1024 * 1024);
  const [storageUsed, setStorageUsed] = useState(0);

  // Mail Preferences state
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);
  const [sendReadReceipts, setSendReadReceipts] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState<"html" | "text">("html");
  const [signature, setSignature] = useState("");

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passChanging, setPassChanging] = useState(false);

  // Security & 2FA State
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    totpEnabled: false,
    twoFactorEnforced: false,
    passkeys: [],
  });
  const [securityLoading, setSecurityLoading] = useState(false);

  // TOTP Setup Wizard state
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpQrUrl, setTotpQrUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [totpCopied, setTotpCopied] = useState(false);

  // TOTP Disable Dialog state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disablingTotp, setDisablingTotp] = useState(false);

  // Passkey Registration state
  const [showAddPasskeyModal, setShowAddPasskeyModal] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const saveHint = "⌘S";

  const loadSecurity = useCallback(async () => {
    setSecurityLoading(true);
    try {
      const data = await rpcCall<SecurityStatus>("user", "securityGet", {});
      setSecurityStatus(data);
    } catch (err: any) {
      console.error("Failed to load security status:", err);
    } finally {
      setSecurityLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await rpcCall<UserSettings>("user", "settingsGet", {});
      setEmail(data.email);
      setDisplayName(data.displayName);
      setRole(data.role);
      setStorageQuota(data.storageQuotaBytes || 10737418240);
      setStorageUsed(data.storageUsedBytes || 0);

      if (data.preferences) {
        setAutoSaveDrafts(data.preferences.autoSaveDrafts !== false);
        setSendReadReceipts(data.preferences.sendReadReceipts === true);
        setDesktopNotifications(data.preferences.desktopNotifications !== false);
        setDefaultFormat(data.preferences.defaultFormat || "html");
        setSignature(data.preferences.signature || "");
      }
    } catch (err: any) {
      console.error("Failed to load user settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    loadSettings();
    loadSecurity();
  }, [router, loadSettings, loadSecurity]);

  const handleSavePreferences = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await rpcCall("user", "settingsUpdate", {
        displayName,
        preferences: {
          signature,
          autoSaveDrafts,
          sendReadReceipts,
          desktopNotifications,
          defaultFormat,
        },
      });
      showToast("Settings and preferences saved successfully!");
    } catch (err: any) {
      alert("Error saving settings: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSavePreferences();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [autoSaveDrafts, sendReadReceipts, desktopNotifications, defaultFormat, signature, displayName]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    setPassChanging(true);
    try {
      await rpcCall("user", "changePassword", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!");
    } catch (err: any) {
      alert("Password change failed: " + (err?.message || "Invalid current password"));
    } finally {
      setPassChanging(false);
    }
  };

  // ── TOTP Setup Handlers ──
  const handleStartTotpSetup = async () => {
    setShowTotpSetup(true);
    try {
      const res = await rpcCall<{ secret: string; otpauthUri: string }>("user", "totpSetup", {});
      setTotpSecret(res.secret);
      const qrDataUrl = await QRCode.toDataURL(res.otpauthUri, {
        width: 192,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setTotpQrUrl(qrDataUrl);
    } catch (err: any) {
      alert("Failed to initiate TOTP setup: " + err.message);
      setShowTotpSetup(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setTotpCopied(true);
    setTimeout(() => setTotpCopied(false), 2500);
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      alert("Please enter the 6-digit verification code from your authenticator.");
      return;
    }

    setTotpVerifying(true);
    try {
      await rpcCall("user", "totpEnable", {
        secret: totpSecret,
        code: totpCode.trim(),
      });
      setShowTotpSetup(false);
      setTotpCode("");
      setTotpSecret("");
      setTotpQrUrl("");
      showToast("Two-Factor Authentication (TOTP) activated successfully!");
      loadSecurity();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setTotpVerifying(false);
    }
  };

  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;

    setDisablingTotp(true);
    try {
      await rpcCall("user", "totpDisable", {
        password: disablePassword,
      });
      setShowDisableModal(false);
      setDisablePassword("");
      showToast("Two-factor authentication disabled.");
      loadSecurity();
    } catch (err: any) {
      alert("Failed to disable 2FA: " + err.message);
    } finally {
      setDisablingTotp(false);
    }
  };

  // ── Passkey Handlers ──
  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteringPasskey(true);
    try {
      const options = await rpcCall<any>("user", "passkeyRegisterOptions", {});
      const regResponse = await startRegistration({ optionsJSON: options });
      await rpcCall("user", "passkeyRegisterVerify", {
        name: passkeyName.trim() || "Hardware Passkey",
        response: regResponse,
      });
      setShowAddPasskeyModal(false);
      setPasskeyName("");
      showToast("Passkey enrolled successfully!");
      loadSecurity();
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        alert("Passkey registration error: " + (err?.message || "Failed to complete biometric handshake"));
      }
    } finally {
      setRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    if (!confirm("Are you sure you want to remove this Passkey from your account?")) return;

    setDeletingPasskeyId(credentialId);
    try {
      await rpcCall("user", "passkeyDelete", { credentialId });
      showToast("Passkey removed.");
      loadSecurity();
    } catch (err: any) {
      alert("Failed to remove passkey: " + err.message);
    } finally {
      setDeletingPasskeyId(null);
    }
  };

  const storageUsedMB = Math.round(storageUsed / (1024 * 1024));
  const storageQuotaMB = Math.round(storageQuota / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsed / storageQuota) * 100));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Loading User Settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── HEADER ── */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="icon-xs" title="Back to Inbox" className="size-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-foreground">Settings & Security</h1>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-muted-foreground border-border/80">
            {email}
          </Badge>
        </div>

        <Button
          size="sm"
          onClick={() => handleSavePreferences()}
          disabled={saving}
          className="gap-1.5 h-8 text-xs font-semibold"
        >
          <Save className="size-3.5" />
          {saving ? "Saving..." : "Save Preferences"}
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px] font-mono">
            {saveHint}
          </kbd>
        </Button>
      </header>

      {/* ── SETTINGS CONTAINER ── */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[
            { id: "profile", label: "Profile & Identity", icon: User },
            { id: "preferences", label: "Mail Preferences", icon: Sliders },
            { id: "security", label: "Security & Passwords", icon: Shield },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-8 gap-2 text-xs ${isActive ? "font-semibold shadow-xs" : ""}`}
              >
                <IconComp className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* ── TAB 1: PROFILE & QUOTA ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Account Identity
                </CardTitle>
                <CardDescription>
                  Your sovereign mailbox profile and display identification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailDisplay">Email Address</Label>
                    <Input id="emailDisplay" value={email} disabled className="bg-muted/40 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleDisplay">Account Role</Label>
                    <div className="pt-1.5">
                      <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider">
                        {role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayNameInput">Display Name</Label>
                  <Input
                    id="displayNameInput"
                    placeholder="Alice Smith"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This name appears in the &quot;From:&quot; header when recipients receive your emails.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="size-4 text-primary" />
                  Storage Allocation
                </CardTitle>
                <CardDescription>
                  Isolated tenant storage with BYOS S3/R2 attachment offloading.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold">{storageUsedMB} MB used</span>
                  <span className="text-muted-foreground">{storageQuotaMB} MB quota ({storagePercent}%)</span>
                </div>
                <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden border border-border/50">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${Math.max(2, storagePercent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Heavy email attachments are safely encrypted and preserved in high-durability object storage.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 2: CLIENT PREFERENCES ── */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Client Behavior Preferences
                </CardTitle>
                <CardDescription>
                  Configure automated drafting, receipt dispatch, and formatting for webmail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-save drafts */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="auto-save" className="text-xs font-semibold text-foreground cursor-pointer">
                      Auto-Save Drafts
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Periodically synchronize email composition buffers to prevent accidental loss.
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSaveDrafts}
                    onCheckedChange={(checked) => setAutoSaveDrafts(!!checked)}
                  />
                </div>

                {/* Read receipts */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="read-receipts" className="text-xs font-semibold text-foreground cursor-pointer">
                      Send Read Receipts
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Acknowledge RFC Disposition-Notification-To header requests when viewing messages.
                    </p>
                  </div>
                  <Switch
                    id="read-receipts"
                    checked={sendReadReceipts}
                    onCheckedChange={(checked) => setSendReadReceipts(!!checked)}
                  />
                </div>

                {/* Desktop Notifications */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="desktop-notifications" className="text-xs font-semibold text-foreground cursor-pointer">
                      Real-Time Incoming Mail Alerts
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Show instant desktop alerts when incoming messages arrive.
                    </p>
                  </div>
                  <Switch
                    id="desktop-notifications"
                    checked={desktopNotifications}
                    onCheckedChange={(checked) => setDesktopNotifications(!!checked)}
                  />
                </div>

                {/* Default to Rich HTML */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <label htmlFor="rich-html" className="text-xs font-semibold text-foreground cursor-pointer">
                      Default to Rich HTML Format
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Open composer in multi-part HTML mode rather than strict plain text.
                    </p>
                  </div>
                  <Switch
                    id="rich-html"
                    checked={defaultFormat === "html"}
                    onCheckedChange={(checked) => setDefaultFormat(checked ? "html" : "text")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Signature Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  Email Signature
                </CardTitle>
                <CardDescription>
                  Standard text appended automatically to all outbound messages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="--&#10;Best regards,&#10;Alice Smith | CellsInbox"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="font-mono text-xs leading-relaxed"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 3: SECURITY & PASSWORDS ── */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* 1. Password Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your authentication password. Hashed sovereignly with Argon2id.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPass"
                        type={showCurrentPass ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPass">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPass"
                          type={showNewPass ? "text" : "password"}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPass">Confirm New Password</Label>
                      <Input
                        id="confirmPass"
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-2">
                  <Button type="submit" size="sm" disabled={passChanging}>
                    {passChanging ? "Updating Password..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* 2. TOTP Two-Factor Authenticator Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="size-4 text-primary" />
                      Two-Factor Authenticator (TOTP)
                    </CardTitle>
                    <CardDescription>
                      RFC 6238 time-based codes from Google Authenticator, 1Password, or Apple Keychain.
                    </CardDescription>
                  </div>
                  <Badge
                    variant={securityStatus.totpEnabled ? "default" : "outline"}
                    className={securityStatus.totpEnabled ? "bg-emerald-600/90 text-white gap-1" : "text-amber-500 border-amber-500/40 gap-1"}
                  >
                    {securityStatus.totpEnabled ? (
                      <>
                        <CheckCircle2 className="size-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3" />
                        Not Enrolled
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus.totpEnabled ? (
                  <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                        <CheckCircle2 className="size-4" />
                        <span>Two-Step Verification is Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={handleStartTotpSetup}
                          className="h-7 text-xs"
                        >
                          Reconfigure
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setShowDisableModal(true)}
                          className="h-7 text-xs"
                        >
                          Disable 2FA
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Your account requires entering a 6-digit verification code on every login session.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Protect your sovereign mailbox from credential stuffing and password leaks by requiring an authenticator code.
                    </p>
                    {!showTotpSetup && (
                      <Button size="sm" onClick={handleStartTotpSetup} className="gap-2">
                        <QrCode className="size-4" />
                        Set Up Authenticator App
                      </Button>
                    )}
                  </div>
                )}

                {/* TOTP Setup Wizard (Shown when configuring) */}
                {showTotpSetup && (
                  <div className="p-5 rounded-xl border border-primary/40 bg-card/80 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <QrCode className="size-4 text-primary" />
                        Scan Authenticator QR Code
                      </h4>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setShowTotpSetup(false);
                          setTotpQrUrl("");
                          setTotpSecret("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {totpQrUrl ? (
                        <div className="p-2.5 rounded-lg bg-white border border-border shadow-sm shrink-0">
                          <img src={totpQrUrl} alt="TOTP QR Code" className="size-40 rounded" />
                        </div>
                      ) : (
                        <div className="size-44 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                          Generating QR...
                        </div>
                      )}

                      <div className="space-y-3 flex-1">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">
                            1. Scan this QR code with Google Authenticator, 1Password, or Bitwarden.
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Or enter the manual secret key if your camera is unavailable:
                          </p>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/60 border border-border/80">
                          <code className="text-xs font-mono font-bold tracking-wider text-foreground flex-1 break-all select-all">
                            {totpSecret || "Loading..."}
                          </code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleCopySecret}
                            title="Copy Secret"
                            className="shrink-0 size-7"
                          >
                            {totpCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyTotp} className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-end">
                      <div className="space-y-1.5 flex-1 w-full">
                        <Label htmlFor="totpCodeInput" className="text-xs font-semibold">
                          2. Enter 6-digit confirmation code
                        </Label>
                        <Input
                          id="totpCodeInput"
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                          required
                          autoFocus
                          className="font-mono text-center tracking-[0.25em] text-base h-10"
                        />
                      </div>
                      <Button type="submit" disabled={totpVerifying || totpCode.length !== 6} className="h-10 px-5 shrink-0">
                        {totpVerifying ? "Verifying..." : "Verify & Enable 2FA"}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. WebAuthn Passkeys (FIDO2 / Biometrics) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Fingerprint className="size-4 text-primary" />
                      Hardware Security Keys & Passkeys
                    </CardTitle>
                    <CardDescription>
                      Phishing-resistant authentication using Touch ID, Face ID, Windows Hello, or YubiKeys.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddPasskeyModal(true)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Plus className="size-3.5" />
                    Add Passkey
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus.passkeys.length === 0 ? (
                  <div className="p-6 text-center rounded-lg border border-dashed border-border text-muted-foreground space-y-2">
                    <Fingerprint className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-xs">No Passkeys enrolled yet.</p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Add a Passkey for instant 1-touch login without needing passwords or authenticator codes.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 rounded-lg border border-border/80 overflow-hidden bg-card/40">
                    {securityStatus.passkeys.map((pk) => (
                      <div key={pk.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Laptop className="size-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-semibold text-foreground truncate">{pk.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Created on {new Date(pk.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                              {pk.lastUsedAt && ` • Last used ${new Date(pk.lastUsedAt).toLocaleDateString([], { month: "short", day: "numeric" })}`}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeletePasskey(pk.id)}
                          disabled={deletingPasskeyId === pk.id}
                          className="text-muted-foreground hover:text-destructive shrink-0 size-8"
                          title="Remove Passkey"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD PASSKEY ── */}
      {showAddPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Fingerprint className="size-5 text-primary" />
                Enroll New Passkey
              </CardTitle>
              <CardDescription>
                Your browser or operating system will prompt you for Touch ID, Face ID, or your physical security key.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegisterPasskey}>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="passkeyNameInput">Passkey Device Nickname</Label>
                  <Input
                    id="passkeyNameInput"
                    placeholder="e.g. Alice's MacBook Pro Touch ID"
                    value={passkeyName}
                    onChange={(e) => setPasskeyName(e.target.value)}
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    A friendly label to identify this device in your account.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddPasskeyModal(false)}
                  disabled={registeringPasskey}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={registeringPasskey} className="gap-2">
                  <Fingerprint className="size-4" />
                  {registeringPasskey ? "Waiting for Biometrics..." : "Prompt Passkey"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ── MODAL: DISABLE TOTP ── */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-5" />
                Disable Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Confirm your account password to remove TOTP authenticator protection.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDisableTotp}>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="disablePass">Current Password</Label>
                  <Input
                    id="disablePass"
                    type="password"
                    placeholder="••••••••••••"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword("");
                  }}
                  disabled={disablingTotp}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={disablingTotp || !disablePassword}>
                  {disablingTotp ? "Disabling..." : "Confirm & Disable 2FA"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

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
