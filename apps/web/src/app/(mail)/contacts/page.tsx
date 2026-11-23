"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  SearchIcon,
  StarIcon,
  TrashBinIcon,
  SendIcon,
  PencilIcon,
} from "@/icons";
import { rpcCall } from "@/lib/api";

interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL search query parameters
  const urlSearch = searchParams.get("search") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlFilter = searchParams.get("filter") || "all"; // 'all' or 'favorites'

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // URL query parameter updater
  const updateQuery = useCallback(
    (params: Record<string, string | number | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val === null || val === "" || val === undefined) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      const query = current.toString() ? `?${current.toString()}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced search input handler
  useEffect(() => {
    if (searchTerm === urlSearch) return;
    const timer = setTimeout(() => {
      updateQuery({ search: searchTerm || null, page: 1 });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, urlSearch, updateQuery]);

  // Keep local searchTerm in sync if URL changes externally (e.g. back/forward)
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Fetch contacts whenever URL searchParams change
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rpcCall<any>(
        "contacts",
        "list",
        {
          search: urlSearch || undefined,
          isFavorite: urlFilter === "favorites" ? true : undefined,
          page: urlPage,
          limit: 20,
        }
      );
      const items = res?.items || res?.contacts || [];
      setContacts(items);
      setTotal(res?.total !== undefined ? res.total : items.length);
    } catch (err: any) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [urlSearch, urlFilter, urlPage]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleToggleFavorite = async (c: ContactItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await rpcCall<{ contact: ContactItem }>("contacts", "update", {
        contactId: c.id,
        isFavorite: !c.isFavorite,
      });
      setContacts((prev) =>
        prev.map((item) => (item.id === c.id ? res.contact : item))
      );
    } catch (err: any) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDeleteContact = async (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await rpcCall("contacts", "delete", { contactId });
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setTotal((t) => Math.max(0, t - 1));
      showToastMsg("Contact deleted");
    } catch (err: any) {
      alert("Error deleting contact: " + err.message);
    }
  };

  const handleSendEmailTo = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/inbox/new?to=${encodeURIComponent(email)}`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Top Breadcrumb & Add Contact button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Address Book & Contacts" />
        <Link href="/contacts/new">
          <Button size="sm" className="gap-2">
            <PlusIcon className="size-4" />
            New Contact
          </Button>
        </Link>
      </div>

      {/* Filter and Debounced Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="xs"
            variant={urlFilter === "all" ? "default" : "outline"}
            onClick={() => updateQuery({ filter: "all", page: 1 })}
            className="text-xs"
          >
            All Contacts ({total})
          </Button>
          <Button
            size="xs"
            variant={urlFilter === "favorites" ? "default" : "outline"}
            onClick={() => updateQuery({ filter: "favorites", page: 1 })}
            className="text-xs gap-1.5"
          >
            <StarIcon className="size-3.5" />
            Favorites
          </Button>
        </div>
      </div>

      {/* TailAdmin Contacts Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                >
                  Company & Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-end text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {contacts.map((c) => {
                const initials = c.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <TableRow
                    key={c.id}
                    onClick={() => router.push(`/contacts/${c.id}`)}
                    className="cursor-pointer transition hover:bg-gray-50/50 dark:hover:bg-white/2"
                  >
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          <AvatarFallback className="bg-brand-500 text-white font-medium text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
                            {c.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {c.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 sm:px-6 dark:text-gray-400">
                      {c.company ? (
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {c.company}
                          </span>
                          {c.jobTitle && (
                            <span className="block text-xs text-gray-400">
                              {c.jobTitle}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 sm:px-6 dark:text-gray-400 font-mono text-xs">
                      {c.phone || <span className="text-gray-400">-</span>}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(c, e)}
                        className="cursor-pointer"
                      >
                        <Badge
                          size="sm"
                          color={c.isFavorite ? "warning" : "gray"}
                          variant="light"
                          className="gap-1 cursor-pointer"
                        >
                          <StarIcon
                            className={`size-3 ${
                              c.isFavorite
                                ? "fill-amber-400 text-amber-500"
                                : "text-gray-400"
                            }`}
                          />
                          {c.isFavorite ? "Favorite" : "Standard"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-end sm:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={(e) => handleSendEmailTo(c.email, e)}
                          className="text-xs gap-1"
                        >
                          <SendIcon className="size-3" />
                          Email
                        </Button>
                        <Link href={`/contacts/${c.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-xs gap-1"
                          >
                            <PencilIcon className="size-3" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={(e) => handleDeleteContact(c.id, e)}
                          className="text-xs"
                          aria-label="Delete Contact"
                        >
                          <TrashBinIcon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {contacts.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    No contacts found. Click &quot;New Contact&quot; to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
