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
  UsersIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LockIcon,
} from "@/icons";
import { Shield } from "lucide-react";
import { rpcCall } from "@/lib/api";

export interface UserItem {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  status: string;
  twoFactorEnforced: boolean;
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
  createdAt: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function UsersListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search and filter derived from searchParams
  const searchParamQuery = searchParams.get("search") || "";
  const filterRole = searchParams.get("role") || "all";
  const [searchTerm, setSearchTerm] = useState(searchParamQuery);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await rpcCall<{ items: UserItem[] }>("admin", "usersList", {});
      setUsers(res?.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Keep search term in sync with URL
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

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (role && role !== "all") {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchParamQuery ||
      u.email.toLowerCase().includes(searchParamQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchParamQuery.toLowerCase()));
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && (u.role === "ORG_ADMIN" || u.role === "PLATFORM_ADMIN" || u.role === "ADMIN")) ||
      (filterRole === "member" && (u.role === "MAILBOX_USER" || u.role === "MEMBER"));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Users & Mailboxes" />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-2"
          >
            <RefreshIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/users/new">
            <Button size="sm" className="gap-2 bg-brand-500 hover:bg-brand-600 text-white">
              <PlusIcon className="size-4" />
              New User
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <ComponentCard
        title="Mailbox Accounts"
        desc="Provision and govern user mailboxes, storage allocations, security credentials, and 2FA enforcement."
      >
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Role:</span>
              <button
                type="button"
                onClick={() => handleRoleFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterRole === "all"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => handleRoleFilter("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterRole === "admin"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Admins ({users.filter((u) => u.role === "ADMIN" || u.role === "PLATFORM_ADMIN").length})
              </button>
              <button
                type="button"
                onClick={() => handleRoleFilter("member")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterRole === "member"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Members ({users.filter((u) => u.role !== "ADMIN" && u.role !== "PLATFORM_ADMIN").length})
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75 dark:bg-gray-900/50">
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Mailbox User
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Role & Status
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Storage Allocation
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Security
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3">
                    Created
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-600 dark:text-gray-300 py-3 text-right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-gray-500">Loading mailbox accounts...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <UsersIcon className="mx-auto size-10 text-gray-300 dark:text-gray-700" />
                      <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        No mailbox accounts found
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchParamQuery
                          ? "Try adjusting your search criteria."
                          : "Provision a new mailbox user to get started."}
                      </p>
                      {!searchParamQuery && (
                        <Link href="/users/new" className="mt-4 inline-block">
                          <Button size="sm" className="gap-2 bg-brand-500 hover:bg-brand-600 text-white">
                            <PlusIcon className="size-4" />
                            New User
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const initials = (user.displayName || user.email)
                      .slice(0, 2)
                      .toUpperCase();
                    const quota = user.storageQuotaBytes || 10 * 1024 * 1024 * 1024;
                    const used = user.storageUsedBytes || 0;
                    const pct = Math.min(100, Math.round((used / quota) * 100));

                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        onClick={() => router.push(`/users/${user.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold text-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user.displayName || user.email.split("@")[0]}
                              </span>
                              <span className="block text-xs font-mono text-gray-500 truncate">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              color={user.role === "ADMIN" || user.role === "PLATFORM_ADMIN" ? "primary" : "gray"}
                              variant="light"
                              className="text-[10px] uppercase font-semibold"
                            >
                              {user.role}
                            </Badge>
                            <Badge
                              color={user.status === "ACTIVE" ? "success" : "warning"}
                              variant="light"
                              className="text-[10px]"
                            >
                              {user.status || "ACTIVE"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 w-36">
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>{formatBytes(used)}</span>
                              <span>{formatBytes(quota)}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-brand-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.twoFactorEnforced ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <Shield className="size-3" />
                              2FA Enforced
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              <LockIcon className="size-3" />
                              Optional
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/users/${user.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                              Manage
                              <ArrowRightIcon className="size-3.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
