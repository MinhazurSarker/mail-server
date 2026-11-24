"use client";

import { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, CheckIcon, CopyIcon } from "@/icons";
import { Building2 } from "lucide-react";
import { rpcCall } from "@/lib/api";

export default function NewOrganizationPage({
  currentUser,
}: {
  currentUser?: any;
} = {}) {
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    slug: "",
    domainName: "",
    adminEmail: "",
    adminPassword: "",
    adminDisplayName: "",
  });
  const [onboarding, setOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setOnboardForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : prev.slug,
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.slug || !onboardForm.domainName || !onboardForm.adminEmail) {
      setError("Please fill in all required fields.");
      return;
    }

    setOnboarding(true);
    setError(null);
    try {
      const res = await rpcCall<any>("platform", "organizationOnboard", onboardForm);
      setSuccessData(res);
    } catch (err: any) {
      setError(err.message || "Failed to onboard organization.");
    } finally {
      setOnboarding(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Onboard Sovereign Tenant" />
        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Governance
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl">
        <ComponentCard
          title="Onboard New Organization"
          desc="Provision an isolated multi-tenant organization with cryptographic sovereign domain keys and administrator account."
        >
          {successData ? (
            <div className="space-y-6 pt-2">
              <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 dark:border-green-900/50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                    <CheckIcon className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-green-900 dark:text-green-200">
                      Organization &quot;{onboardForm.name}&quot; Successfully Onboarded!
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Isolated tenant vault created and administrator account provisioned.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/[0.02]">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tenant Details &amp; Administrator Credentials
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="text-gray-500 text-[11px] mb-1 font-sans">Tenant Slug:</div>
                    <div className="font-semibold text-gray-900 dark:text-white select-all">
                      {successData.slug || onboardForm.slug}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="text-gray-500 text-[11px] mb-1 font-sans">Admin Email:</div>
                    <div className="font-semibold text-gray-900 dark:text-white select-all">
                      {successData.adminEmail || onboardForm.adminEmail}
                    </div>
                  </div>
                </div>

                {onboardForm.adminPassword && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-900/50 flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-[11px] mb-0.5">Admin Password:</div>
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white select-all">
                        {onboardForm.adminPassword}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => copyToClipboard(onboardForm.adminPassword, "pass")}
                    >
                      {copiedKey === "pass" ? (
                        <>
                          <CheckIcon className="size-3.5 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="size-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {successData.dnsRecords && successData.dnsRecords.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Generated DNS Records ({successData.dnsRecords.length})
                  </h5>
                  <div className="space-y-2">
                    {successData.dnsRecords.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40 text-xs font-mono"
                      >
                        <div className="space-y-0.5 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                              {rec.type}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {rec.name}
                            </span>
                          </div>
                          <p className="truncate text-gray-500 dark:text-gray-400 text-[11px]">
                            {rec.value}
                          </p>
                        </div>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(rec.value, `rec-${idx}`)}
                        >
                          {copiedKey === `rec-${idx}` ? (
                            <CheckIcon className="size-3.5 text-green-500" />
                          ) : (
                            <CopyIcon className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Back to Governance
                  </Button>
                </Link>
                <Link href={`/org/${successData.slug || onboardForm.slug}/admin`}>
                  <Button size="sm" className="gap-2">
                    <Building2 className="size-4" />
                    Open Tenant Admin
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Organization Name *
                  </label>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={onboardForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    The legal entity or company display name.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Unique Slug *
                  </label>
                  <Input
                    placeholder="e.g. acme"
                    value={onboardForm.slug}
                    onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Used for isolated governance URLs: /org/[slug]/admin.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Primary Domain Name *
                </label>
                <Input
                  placeholder="e.g. acme.com or mail.acme.com"
                  value={onboardForm.domainName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, domainName: e.target.value })}
                  required
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Apex or dedicated mail subdomain to bind to this organization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Administrator Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@acme.com"
                    value={onboardForm.adminEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Primary root administrator login for this organization.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Administrator Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={onboardForm.adminPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Secure temporary password for initial administrator login.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Administrator Display Name
                </label>
                <Input
                  placeholder="e.g. John Doe (Platform Lead)"
                  value={onboardForm.adminDisplayName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminDisplayName: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link href="/admin">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" size="sm" disabled={onboarding}>
                  {onboarding ? "Provisioning Tenant..." : "Onboard Organization"}
                </Button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
