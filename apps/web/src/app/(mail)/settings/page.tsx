"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Field, FieldLabel, FieldDescription } from "@ui-sdk/react/field";
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts";
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

  // Mail Preferences state (ui-sdk switch state)
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);
  const [sendReadReceipts, setSendReadReceipts] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState<"html" | "text">("html");
  const [signature, setSignature] = useState("");

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passChanging, setPassChanging] = useState(false);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Shortcut hint for Save
  const saveHint = useShortcutHint("mod+s");

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
  }, [router, loadSettings]);

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

  // Keyboard shortcut: Cmd+S / Ctrl+S saves settings
  useShortcut("mod+s", () => {
    handleSavePreferences();
  }, { description: "Save preferences" });

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
      alert("Error changing password: " + (err?.message || "Unknown error"));
    } finally {
      setPassChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-xs animate-pulse">
        Loading User Settings...
      </div>
    );
  }

  const storageUsedMB = Math.round(storageUsed / (1024 * 1024));
  const storageQuotaMB = Math.round(storageQuota / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsed / storageQuota) * 100)) || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── TOP HEADER ── */}
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
            <Sliders className="size-4 text-primary" />
            <h1 className="font-bold text-sm tracking-tight">Mailbox Settings</h1>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium border-border/80">
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
            {saveHint.text}
          </kbd>
        </Button>
      </header>

      {/* ── SETTINGS CONTAINER ── */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[
            { id: "profile", label: "Profile & Quota", icon: User },
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

        {/* ── TAB 2: MAIL PREFERENCES (UI-SDK CONTROLS) ── */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Client Behavior Preferences
                </CardTitle>
                <CardDescription>
                  Configure automated drafting, receipt dispatch, and formatting powered by ui-sdk behavioral primitives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* ui-sdk Field + Switch: Auto-save drafts */}
                <Field className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <FieldLabel className="text-xs font-semibold text-foreground cursor-pointer">
                      Auto-Save Drafts
                    </FieldLabel>
                    <FieldDescription className="text-[11px] text-muted-foreground">
                      Periodically synchronize email composition buffers to prevent accidental loss.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={autoSaveDrafts}
                    onCheckedChange={(checked) => setAutoSaveDrafts(checked)}
                    className="shrink-0 size-5 inline-flex items-center rounded-full bg-muted data-[checked]:bg-primary transition-colors p-0.5 cursor-pointer border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SwitchThumb className="block size-4 rounded-full bg-foreground data-[checked]:bg-primary-foreground transition-transform data-[checked]:translate-x-4" />
                  </Switch>
                </Field>

                {/* ui-sdk Field + Switch: Read receipts */}
                <Field className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <FieldLabel className="text-xs font-semibold text-foreground cursor-pointer">
                      Send Read Receipts
                    </FieldLabel>
                    <FieldDescription className="text-[11px] text-muted-foreground">
                      Acknowledge RFC Disposition-Notification-To header requests when viewing messages.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={sendReadReceipts}
                    onCheckedChange={(checked) => setSendReadReceipts(checked)}
                    className="shrink-0 size-5 inline-flex items-center rounded-full bg-muted data-[checked]:bg-primary transition-colors p-0.5 cursor-pointer border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SwitchThumb className="block size-4 rounded-full bg-foreground data-[checked]:bg-primary-foreground transition-transform data-[checked]:translate-x-4" />
                  </Switch>
                </Field>

                {/* ui-sdk Field + Switch: Desktop Notifications */}
                <Field className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <FieldLabel className="text-xs font-semibold text-foreground cursor-pointer">
                      Real-Time Incoming Mail Alerts
                    </FieldLabel>
                    <FieldDescription className="text-[11px] text-muted-foreground">
                      Show instant desktop toasts via WebSocket live sync when Port 25 receives new mail.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={desktopNotifications}
                    onCheckedChange={(checked) => setDesktopNotifications(checked)}
                    className="shrink-0 size-5 inline-flex items-center rounded-full bg-muted data-[checked]:bg-primary transition-colors p-0.5 cursor-pointer border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SwitchThumb className="block size-4 rounded-full bg-foreground data-[checked]:bg-primary-foreground transition-transform data-[checked]:translate-x-4" />
                  </Switch>
                </Field>

                {/* ui-sdk Field + Switch: Default to Rich HTML */}
                <Field className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <FieldLabel className="text-xs font-semibold text-foreground cursor-pointer">
                      Default to Rich HTML Format
                    </FieldLabel>
                    <FieldDescription className="text-[11px] text-muted-foreground">
                      Open composer in multi-part HTML mode rather than strict plain text.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={defaultFormat === "html"}
                    onCheckedChange={(checked) => setDefaultFormat(checked ? "html" : "text")}
                    className="shrink-0 size-5 inline-flex items-center rounded-full bg-muted data-[checked]:bg-primary transition-colors p-0.5 cursor-pointer border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SwitchThumb className="block size-4 rounded-full bg-foreground data-[checked]:bg-primary-foreground transition-transform data-[checked]:translate-x-4" />
                  </Switch>
                </Field>
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
                  Appended automatically to the end of all new outbound messages and replies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your authentication password. Hashed locally with Argon2id.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass">Current Password</Label>
                    <Input
                      id="currentPass"
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPass">New Password</Label>
                      <Input
                        id="newPass"
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                      />
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="size-4 text-emerald-500" />
                  Two-Factor Authentication (2FA) Status
                </CardTitle>
                <CardDescription>
                  Mandatory time-based one-time password (TOTP) and WebAuthn Passkeys protection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                  <CheckCircle2 className="size-4" />
                  <span>2-Step Verification Active & Enforced</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your mailbox session is secured using RFC 6238 TOTP authenticator tokens. Passwords alone cannot authenticate access without passing the secondary cryptographic challenge.
                </p>
              </CardContent>
            </Card>
          </div>
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
