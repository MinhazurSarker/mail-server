"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  KeyIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  CheckCircleIcon,
  CopyIcon,
  CheckIcon,
} from "@/icons";
import { Trash2, Shield, Code, ArrowRight } from "lucide-react";
import { rpcCall } from "@/lib/api";
import type { AuthenticatedUser } from "@/server/middleware/checkAuth";

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function ApiKeysClient({
  currentUser,
}: {
  currentUser: AuthenticatedUser;
}) {
  const [, startTransition] = useTransition();
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedPrefix, setCopiedPrefix] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await rpcCall<{ items: ApiKeyItem[] }>("apiKey", "list", {});
      setApiKeys(res?.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleRevokeKey = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to revoke the API key "${name}"? External applications sending through this key will immediately fail.`
      )
    ) {
      return;
    }
    setRevokingId(id);
    try {
      await rpcCall("apiKey", "revoke", { apiKeyId: id });
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to revoke API key.");
    } finally {
      setRevokingId(null);
    }
  };

  const filteredKeys = apiKeys.filter((k) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      k.name.toLowerCase().includes(term) ||
      k.keyPrefix.toLowerCase().includes(term) ||
      k.allowedDomains.some((d) => d.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="API Keys" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApiKeys}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/api-keys/new">
            <Button
              size="sm"
              className="gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer shadow-sm text-xs font-medium"
            >
              <PlusIcon className="size-4" />
              Generate API Key
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <KeyIcon className="size-6 stroke-[1.5px]" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Active API Keys
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiKeys.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Shield className="size-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Hash Storage
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Argon2id (Zero Raw Storage)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Code className="size-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              SDK Protocol
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              SendGrid v3 & Cells RPC
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <ComponentCard
        title="SendGrid-Compatible API Keys"
        desc="Programmatic bearer tokens for sending transactional emails, notification pipelines, and templates."
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search keys by name or prefix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <p className="text-xs text-gray-400 self-end sm:self-center">
              Showing {filteredKeys.length} of {apiKeys.length} keys
            </p>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/2 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  <TableHead className="py-3 px-4">Key Name</TableHead>
                  <TableHead className="py-3 px-4">Prefix</TableHead>
                  <TableHead className="py-3 px-4">Allowed Domains</TableHead>
                  <TableHead className="py-3 px-4">Rate Limit</TableHead>
                  <TableHead className="py-3 px-4">Created</TableHead>
                  <TableHead className="py-3 px-4">Last Used</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-xs text-gray-400">
                      Loading API keys...
                    </TableCell>
                  </TableRow>
                ) : filteredKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="space-y-3 max-w-sm mx-auto">
                        <div className="size-10 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mx-auto flex items-center justify-center">
                          <KeyIcon className="size-5 stroke-[1.5px]" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          No API keys found
                        </p>
                        <p className="text-xs text-gray-500">
                          {searchTerm
                            ? "No keys match your search criteria."
                            : "Generate your first API key to start dispatching transactional mail via cURL or SDK."}
                        </p>
                        {!searchTerm && (
                          <Link href="/api-keys/new">
                            <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white text-xs gap-1.5 mt-2">
                              <PlusIcon className="size-3.5" />
                              Generate API Key
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeys.map((key) => (
                    <TableRow key={key.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 text-xs">
                      <TableCell className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <KeyIcon className="size-4 text-brand-500 shrink-0 stroke-[1.5px]" />
                          <span>{key.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <span>{key.keyPrefix}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(key.keyPrefix);
                              setCopiedPrefix(key.id);
                              setTimeout(() => setCopiedPrefix(null), 1500);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Copy prefix"
                          >
                            {copiedPrefix === key.id ? (
                              <CheckIcon className="size-3 text-emerald-500" />
                            ) : (
                              <CopyIcon className="size-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {key.allowedDomains.map((dom, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] font-mono border-gray-200 dark:border-gray-800"
                            >
                              {dom === "*" ? "All Domains (*)" : dom}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        {key.rateLimitPerMinute} req/min
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {new Date(key.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id, key.name)}
                          disabled={revokingId === key.id}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Revoke key"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>

      {/* Integration Guide Card */}
      <ComponentCard
        title="Developer Integration Guide"
        desc="Use SendGrid-compatible REST or sovereign JSON-RPC headers with Bearer authentication."
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600 dark:text-gray-300">
            Pass your generated secret key in the <code className="font-mono bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400">Authorization: Bearer ci_live_...</code> header.
          </p>
          <div className="rounded-xl bg-zinc-950 text-zinc-100 p-4 font-mono text-[11px] overflow-x-auto border border-zinc-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-400 text-[10px]">
              <span>cURL Transactional Dispatch</span>
              <span>HTTP POST</span>
            </div>
            <pre>{`curl -X POST https://webmail.cellsweb.com/rpc \\
  -H "Authorization: Bearer ci_live_YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "apiKey",
    "functionName": "send",
    "data": {
      "to": ["recipient@example.com"],
      "subject": "System Verification Alert",
      "text": "Your account verification link is ready."
    }
  }'`}</pre>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
