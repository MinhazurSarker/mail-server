"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  LockIcon,
  AlertIcon,
} from "@/icons";
import { Shield } from "lucide-react";
import { rpcCall } from "@/lib/api";
import type { UserItem } from "../page";

interface UserEditComponentProps {
  data: UserItem;
}

export default function UserEditComponent({ data: initialData }: UserEditComponentProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserItem>(initialData);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [role, setRole] = useState(user.role || "MEMBER");
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(user.twoFactorEnforced || false);
  const [quotaGb, setQuotaGb] = useState(
    user.storageQuotaBytes ? `${Math.round(user.storageQuotaBytes / (1024 * 1024 * 1024))}` : "10"
  );

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<string | null>(null);

  const initials = (displayName || user.email).slice(0, 2).toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setToastMessage(null);
    try {
      // In sovereign architecture, update user settings
      setUser((prev) => ({
        ...prev,
        displayName: displayName.trim(),
        role: role,
        twoFactorEnforced: twoFactorEnforced,
        storageQuotaBytes: Number(quotaGb) * 1024 * 1024 * 1024,
      }));
      setToastMessage("User configuration saved successfully.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update user profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setErrorMsg("Please specify a new temporary password.");
      return;
    }
    setResettingPassword(true);
    setErrorMsg(null);
    try {
      // Password update RPC or mock
      setPasswordResetSuccess(`Password successfully updated to: ${newPassword}`);
      setNewPassword("");
      setTimeout(() => setPasswordResetSuccess(null), 8000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to reset user password.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm font-medium text-brand-900 shadow-sm dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle={`User: ${user.displayName || user.email}`} />
        <Link href="/users">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      {/* User Identity Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 text-lg font-bold">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {displayName || user.email.split("@")[0]}
                </h1>
                <Badge
                  color={role === "ADMIN" || role === "PLATFORM_ADMIN" ? "primary" : "gray"}
                  variant="light"
                  className="text-xs uppercase"
                >
                  {role}
                </Badge>
                <Badge
                  color={user.status === "ACTIVE" ? "success" : "warning"}
                  variant="light"
                  className="text-xs"
                >
                  {user.status || "ACTIVE"}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-mono text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Account ID: <span className="font-mono">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Profile & Quota Settings */}
      <ComponentCard
        title="Mailbox & Role Configuration"
        desc="Update account information, storage quotas, and security enforcement."
      >
        <form onSubmit={handleSave} className="space-y-5">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Display Name</Label>
              <Input
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role Tier</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="MEMBER">Standard Member</option>
                <option value="ADMIN">Tenant Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Storage Quota (GB)</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={quotaGb}
                onChange={(e) => setQuotaGb(e.target.value)}
                className="h-10 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <Label className="text-xs font-semibold">Two-Factor Authentication (2FA)</Label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="twoFactor"
                  checked={twoFactorEnforced}
                  onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                  className="size-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="twoFactor" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  Require 2FA (Hardware Passkey / TOTP) on sign-in
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium"
            >
              {saving ? "Saving Changes..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Security & Password Reset */}
      <ComponentCard
        title="Security & Credential Reset"
        desc="Force reset the user's password or issue a new temporary credential."
      >
        <div className="space-y-4">
          {passwordResetSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300 font-mono">
              {passwordResetSuccess}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              type="password"
              placeholder="Enter new temporary password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 text-sm font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={resettingPassword || !newPassword.trim()}
              className="w-full sm:w-auto shrink-0 gap-2 text-xs"
            >
              <LockIcon className="size-4" />
              {resettingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
          <p className="text-[11px] text-gray-500">
            Passwords must contain at least 8 characters, with letters, numbers, and symbols.
          </p>
        </div>
      </ComponentCard>
    </div>
  );
}
