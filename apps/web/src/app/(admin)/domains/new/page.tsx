"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "@/icons";
import { rpcCall } from "@/lib/api";

export default function NewDomainPage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [dkimSelector, setDkimSelector] = useState("ci");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!domainName.trim()) {
      setErrorMsg("Please provide a domain name (e.g. acme.com).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await rpcCall<any>("domain", "create", {
        name: domainName.trim().toLowerCase(),
        dkimSelector: dkimSelector.trim() || "ci",
      });
      const createdId = res?.domain?.id || res?.id || res?.domain?._id;
      if (createdId) {
        router.push(`/domains/${createdId}`);
      } else {
        router.push("/domains");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create domain");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Add New Domain" />
        <Link href="/domains">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Domains
          </Button>
        </Link>
      </div>

      <ComponentCard
        title="Connect Custom Domain"
        desc="Add your custom domain to generate cryptographic 2048-bit DKIM keys, SPF, and DMARC records."
      >
        <form onSubmit={handleCreateDomain} className="space-y-5">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Domain Name *</Label>
              <Input
                placeholder="example.com or mail.example.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                required
                className="h-10 text-sm font-mono"
              />
              <p className="text-[11px] text-gray-500">
                Enter your apex domain (e.g. acme.com) or dedicated subdomain (e.g. mail.acme.com).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">DKIM Selector</Label>
              <Input
                placeholder="ci"
                value={dkimSelector}
                onChange={(e) => setDkimSelector(e.target.value)}
                className="h-10 text-sm font-mono"
              />
              <p className="text-[11px] text-gray-500">
                Default: <span className="font-mono">ci</span> (resolves as <span className="font-mono">ci._domainkey.{domainName || "domain.com"}</span>).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Encryption Strength</Label>
              <Input
                value="RSA 2048-bit (Production Standard)"
                disabled
                className="h-10 text-sm bg-gray-50 text-gray-500 dark:bg-gray-800"
              />
              <p className="text-[11px] text-gray-500">
                Cryptographically secure private key generated in isolated vault.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/domains">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Generating Keys..." : "Generate DNS Records & Connect"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
