"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
} from "@/components/ui/table";
import {
  GlobeIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertIcon,
  ArrowRightIcon,
} from "@/icons";
import { rpcCall } from "@/lib/api";

export interface DomainItem {
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

export default function DomainsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search and filter derived from searchParams
  const searchParamQuery = searchParams.get("search") || "";
  const filterStatus = searchParams.get("status") || "all";
  const [searchTerm, setSearchTerm] = useState(searchParamQuery);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await rpcCall<{ items: DomainItem[] }>("admin", "domainsList", {});
      setDomains(res?.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load domains");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Keep local search in sync with URL
  useEffect(() => {
    setSearchTerm(searchParamQuery);
  }, [searchParamQuery]);

  // Debounced search updates URL searchParams
  useEffect(() => {
    if (searchTerm === searchParamQuery) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParamQuery, pathname, router, searchParams]);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const filteredDomains = domains.filter((d) => {
    const matchesSearch =
      !searchParamQuery ||
      d.name.toLowerCase().includes(searchParamQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" && d.isVerified) ||
      (filterStatus === "pending" && !d.isVerified);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Custom Domains & DNS" />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDomains}
            disabled={loading}
            className="gap-2"
          >
            <RefreshIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/domains/new">
            <Button size="sm" className="gap-2 bg-brand-500 hover:bg-brand-600 text-white">
              <PlusIcon className="size-4" />
              Add Domain
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Card */}
      <ComponentCard
        title="Domain Infrastructure"
        desc="Connect and manage custom sender domains with Stalwart-grade cryptographic DKIM keys, SPF, and DMARC enforcement."
      >
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Filter:</span>
              <button
                type="button"
                onClick={() => handleStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                All ({domains.length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilter("verified")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === "verified"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Verified ({domains.filter((d) => d.isVerified).length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === "pending"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Pending ({domains.filter((d) => !d.isVerified).length})
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Domains Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75 dark:bg-gray-900/50">
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Domain
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Status
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    DNS Records (MX · SPF · DKIM · DMARC)
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Added
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3 text-right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-gray-500">Loading domains...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <GlobeIcon className="mx-auto size-10 text-gray-300 dark:text-gray-700" />
                      <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        No domains found
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchParamQuery
                          ? "Try adjusting your search criteria."
                          : "Add your first custom domain to set up email routing."}
                      </p>
                      {!searchParamQuery && (
                        <Link href="/domains/new" className="mt-4 inline-block">
                          <Button size="sm" className="gap-2 bg-brand-500 hover:bg-brand-600 text-white">
                            <PlusIcon className="size-4" />
                            Add Domain
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDomains.map((domain) => (
                    <TableRow
                      key={domain.id}
                      className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => router.push(`/domains/${domain.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400">
                            <GlobeIcon className="size-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                              {domain.name}
                            </span>
                            <p className="text-[11px] text-gray-500">
                              Selector: <span className="font-mono">{domain.dkimSelector || "ci"}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {domain.isVerified ? (
                          <Badge color="success" variant="light" className="gap-1 text-[11px]">
                            <CheckCircleIcon className="size-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge color="warning" variant="light" className="gap-1 text-[11px]">
                            <AlertIcon className="size-3" />
                            Pending Verification
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              domain.mxStatus === "pass" || domain.mxStatus === "valid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            MX
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              domain.spfStatus === "pass" || domain.spfStatus === "valid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            SPF
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              domain.dkimStatus === "pass" || domain.dkimStatus === "valid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            DKIM
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              domain.dmarcStatus === "pass" || domain.dmarcStatus === "valid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            DMARC
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {domain.createdAt
                          ? new Date(domain.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/domains/${domain.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            Configure DNS
                            <ArrowRightIcon className="size-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
