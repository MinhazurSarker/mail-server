"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  KeyIcon,
} from "@/icons";
import { Shield, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { rpcCall } from "@/lib/api";
import type { AuthenticatedUser } from "@/server/middleware/checkAuth";

interface DomainOption {
  id: string;
  name: string;
}

export default function NewApiKeyClient({
  currentUser,
}: {
  currentUser: AuthenticatedUser;
}) {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  // Form fields
  const [keyName, setKeyName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("*");
  const [rateLimit, setRateLimit] = useState("60");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success view state
  const [generatedKey, setGeneratedKey] = useState<{
    rawSecretKey: string;
    apiKey: {
      id: string;
      name: string;
      keyPrefix: string;
      allowedDomains: string[];
      rateLimitPerMinute: number;
    };
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

    if (!keyName.trim()) {
      setErrorMsg("Please provide a name for this API key.");
      return;
    }

    const rateLimitNum = parseInt(rateLimit, 10);
    if (isNaN(rateLimitNum) || rateLimitNum < 1) {
      setErrorMsg("Rate limit must be at least 1 request per minute.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await rpcCall<{
        apiKey: any;
        rawSecretKey: string;
      }>("apiKey", "create", {
        name: keyName.trim(),
        allowedDomains: selectedDomain === "*" ? ["*"] : [selectedDomain],
        rateLimitPerMinute: rateLimitNum,
      });

      setGeneratedKey(res);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to generate API key.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!generatedKey?.rawSecretKey) return;
    navigator.clipboard.writeText(generatedKey.rawSecretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Generate API Key" />
        <Link href="/api-keys">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeftIcon className="size-4" />
            Back to API Keys
          </Button>
        </Link>
      </div>

      {generatedKey ? (
        /* Secret Key Generated View */
        <div className="space-y-6">
          <ComponentCard
            title="API Key Created Successfully"
            desc="Please copy this secret key now. You will never be able to view it again."
          >
            <div className="space-y-6">
              {/* Alert Callout */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Security Notice</p>
                  <p>
                    CellsInbox hashes all API tokens with Argon2id immediately upon creation.
                    We do not store the plain text key. If you lose this key, you must revoke it and generate a new one.
                  </p>
                </div>
              </div>

              {/* Secret Key Display */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Secret API Key ({generatedKey.apiKey.name})
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={generatedKey.rawSecretKey}
                      className="font-mono text-sm bg-gray-50 dark:bg-zinc-900 border-brand-200 dark:border-brand-900/50 text-brand-600 dark:text-brand-400 pr-10"
                    />
                  </div>
                  <Button
                    onClick={handleCopy}
                    className={`gap-1.5 shrink-0 text-xs font-medium ${
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-brand-500 hover:bg-brand-600 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="size-4" />
                        Copy Secret Key
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500">Key Prefix:</span>
                  <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">
                    {generatedKey.apiKey.keyPrefix}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Allowed Sender Domain:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                    {generatedKey.apiKey.allowedDomains.join(", ")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Rate Limit:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                    {generatedKey.apiKey.rateLimitPerMinute} requests/min
                  </p>
                </div>
              </div>

              {/* Code Example */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Ready-to-run cURL Example
                </Label>
                <div className="rounded-xl bg-zinc-950 text-zinc-100 p-4 font-mono text-[11px] overflow-x-auto border border-zinc-800">
                  <pre>{`curl -X POST https://webmail.cellsweb.com/rpc \\
  -H "Authorization: Bearer ${generatedKey.rawSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "apiKey",
    "functionName": "send",
    "data": {
      "to": ["recipient@example.com"],
      "subject": "Hello from Sovereign Mail",
      "text": "Sent programmatically via CellsInbox API"
    }
  }'`}</pre>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedKey(null);
                    setKeyName("");
                    setSelectedDomain("*");
                    setRateLimit("60");
                  }}
                  className="text-xs"
                >
                  Generate Another Key
                </Button>
                <Link href="/api-keys">
                  <Button
                    size="sm"
                    className="bg-brand-500 hover:bg-brand-600 text-white text-xs gap-1.5"
                  >
                    Done & Return to API Keys
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </ComponentCard>
        </div>
      ) : (
        /* Create Key Form */
        <ComponentCard
          title="Create Programmatic Token"
          desc="Generate SendGrid-compatible API keys with per-domain scoping and rate limiting."
        >
          <form onSubmit={handleCreate} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">Key Name *</Label>
                <Input
                  placeholder="e.g. Production Webhook Mailer, GitHub Actions CI"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
                <p className="text-[11px] text-gray-500">
                  A descriptive label to identify which service or integration uses this token.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Allowed Sender Domain</Label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="*">All Verified Domains (*)</option>
                  {domains.map((dom) => (
                    <option key={dom.id} value={dom.name}>
                      {dom.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">
                  Restrict this token to send emails only from a specific domain, or allow all verified domains.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Rate Limit (requests / minute)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
                <p className="text-[11px] text-gray-500">
                  Maximum outbound sending throughput per minute for this key.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link href="/api-keys">
                <Button variant="ghost" size="sm" type="button" className="text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || !keyName.trim()}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs gap-1.5"
              >
                <KeyIcon className="size-4 stroke-[1.5px]" />
                {submitting ? "Generating Key..." : "Generate API Key"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      )}
    </div>
  );
}
