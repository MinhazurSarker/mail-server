"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, CheckIcon, CopyIcon, UsersIcon } from "@/icons";
import { rpcCall } from "@/lib/api";

interface DomainOption {
  id: string;
  name: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  const [username, setUsername] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [quotaGb, setQuotaGb] = useState("10");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    email: string;
    temporaryPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    rpcCall<{ items: any[] }>("admin", "domainsList", {})
      .then((res) => {
        if (!isMounted) return;
        const doms = (res.items || []).map((d: any) => ({
          id: d.id,
          name: d.name,
        }));
        setDomains(doms);
        if (doms.length > 0) {
          setSelectedDomainId(doms[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load domains:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingDomains(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const domain = domains.find((d) => d.id === selectedDomainId);
    if (!domain) {
      setErrorMsg("Please select a verified domain for this mailbox.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Please enter a username or email address.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const fullEmail = cleanUsername.includes("@")
      ? cleanUsername
      : `${cleanUsername}@${domain.name}`;

    setSubmitting(true);
    try {
      const res = await rpcCall<any>("admin", "userCreate", {
        domainId: selectedDomainId,
        email: fullEmail,
        displayName: displayName.trim() || undefined,
        role: role,
      });

      setCreatedResult({
        email: fullEmail,
        temporaryPassword: res?.temporaryPassword,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create user mailbox");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (createdResult?.temporaryPassword) {
      navigator.clipboard.writeText(createdResult.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Provision New Mailbox User" />
        <Link href="/users">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      {createdResult ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-gray-900 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Mailbox Created Successfully!
              </h2>
              <p className="text-xs text-gray-500">
                The user account is active and ready to send and receive sovereign emails.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mailbox Email:
              </span>
              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {createdResult.email}
              </p>
            </div>

            {createdResult.temporaryPassword && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Temporary Password:
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                    {createdResult.temporaryPassword}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="size-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="size-3.5" />
                        Copy Password
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                  Please share this password securely with the user. They will be prompted to change it or enroll passkeys on first login.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/users">
              <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
                View All Users
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreatedResult(null);
                setUsername("");
                setDisplayName("");
              }}
            >
              Provision Another Mailbox
            </Button>
          </div>
        </div>
      ) : (
        <ComponentCard
          title="Account Provisioning"
          desc="Create a dedicated mailbox account with cryptographic sovereign routing."
        >
          <form onSubmit={handleCreate} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mailbox Prefix & Domain */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Username / Email Prefix *</Label>
                <div className="flex items-center">
                  <Input
                    placeholder="john.doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-10 text-sm font-mono rounded-r-none border-r-0"
                  />
                  <div className="flex items-center px-2.5 h-10 bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 text-xs font-mono">
                    @
                  </div>
                  <select
                    value={selectedDomainId}
                    onChange={(e) => setSelectedDomainId(e.target.value)}
                    disabled={loadingDomains || domains.length === 0}
                    className="h-10 rounded-r-xl border border-l-0 border-gray-200 bg-white px-3 text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    {domains.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-gray-500">
                  {domains.length === 0
                    ? "No domains available. Please add a domain first."
                    : "The full email address for this mailbox."}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Display Name</Label>
                <Input
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-[11px] text-gray-500">
                  Displayed as sender name in outgoing emails.
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role & Access Tier</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="MEMBER">Standard Member (Mailbox User)</option>
                  <option value="ADMIN">Tenant Administrator (Full Org Access)</option>
                </select>
                <p className="text-[11px] text-gray-500">
                  Admins can manage organization settings, domains, and other users.
                </p>
              </div>

              {/* Storage Quota */}
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
                <p className="text-[11px] text-gray-500">
                  Default: 10 GB per mailbox.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <Link href="/users">
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || domains.length === 0}
                className="gap-2 bg-brand-500 hover:bg-brand-600 text-white"
              >
                {submitting ? "Provisioning..." : "Provision User"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      )}
    </div>
  );
}
