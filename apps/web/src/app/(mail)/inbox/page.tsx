"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import {
  InboxLayout,
  MailList,
  type MailItem,
} from "@/components/support/email";
import { rpcCall } from "@/lib/api";
import { useMailSocket, type MailEventPayload, type MailStateChangedPayload } from "@/lib/useMailSocket";
import { getStoredAccounts, getActiveAccount, saveAccount, type StoredAccount } from "@/lib/account-store";

interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  role: string;
  organizationId: string;
  orgSlug?: string;
  orgName?: string;
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
  maxSingleFileSizeBytes?: number;
  maxAttachmentCount?: number;
}

function InboxContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const urlFolder = searchParams.get("folder") || "INBOX";
  const urlSearch = searchParams.get("search") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlLabel = searchParams.get("label") || null;

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<MailItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // URL query updater
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

  // Debounce search term changes to URL
  useEffect(() => {
    if (searchTerm === urlSearch) return;
    const timer = setTimeout(() => {
      updateQuery({ search: searchTerm || null, page: 1 });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, urlSearch, updateQuery]);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // 1. Fetch authenticated user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await rpcCall<UserProfile>("auth", "me", {});
      setUser(res);

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
      if (token && res.userId) {
        saveAccount({
          userId: res.userId,
          email: res.email,
          displayName: res.displayName,
          organizationId: res.organizationId,
          orgSlug: res.orgSlug,
          role: res.role,
          token,
          isActive: true,
        });
      }
    } catch {
      // Handled by auth middleware
    }
  }, []);

  // 2. Fetch mailbox folder statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await rpcCall<any>("mail", "stats", {});
      if (res?.counts) {
        setCounts(res.counts);
      }
    } catch {
      // Fallback
    }
  }, []);

  // 3. Fetch messages based on URL query
  const fetchMessages = useCallback(async () => {
    try {
      const filterParams: any = {
        folder: urlFolder,
        search: urlSearch || undefined,
        page: urlPage,
        limit: 50,
      };

      if (urlFolder === "STARRED") {
        filterParams.isStarred = true;
        delete filterParams.folder;
      }

      const res = await rpcCall<any>("mail", "list", filterParams);
      const items = Array.isArray(res) ? res : res?.messages || res?.items || [];

      const formatted: MailItem[] = items.map((m: any) => ({
        id: m.messageId || m.id || m._id,
        sender: m.from?.name || m.from?.address?.split("@")[0] || m.sender || "Unknown",
        email: m.from?.address || m.senderEmail || m.email || "user@domain.com",
        subject: m.subject || "(no subject)",
        content: m.snippet || m.text || "",
        date: m.date ? new Date(m.date).toLocaleDateString() : "Today",
        time: m.date ? new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        isRead: m.isRead || false,
        isStarred: m.isStarred || false,
        priority: m.priority || "normal",
        label: m.label || (m.tags && m.tags[0]) || undefined,
        hasAttachments: Boolean(m.attachments && m.attachments.length > 0),
      }));

      setMessages(formatted);

      // Initialize stars map
      const initialStars: Record<string, boolean> = {};
      formatted.forEach((item) => {
        if (item.isStarred) initialStars[item.id] = true;
      });
      setStarredIds(initialStars);
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
    }
  }, [urlFolder, urlSearch, urlPage]);

  // Initial load
  useEffect(() => {
    fetchUserProfile();
    fetchStats();
  }, [fetchUserProfile, fetchStats]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 4. WebSocket Real-Time Integration
  const handleNewMail = useCallback((event: MailEventPayload) => {
    showToast(`New email from ${event.from?.name || event.from?.address}: ${event.subject}`);
    fetchMessages();
    fetchStats();
  }, [fetchMessages, fetchStats]);

  const handleStateChanged = useCallback((event: MailStateChangedPayload) => {
    if (event.isRead !== undefined) {
      setMessages((prev) =>
        prev.map((m) => (m.id === event.messageId ? { ...m, isRead: event.isRead! } : m))
      );
    }
    if (event.isStarred !== undefined) {
      setStarredIds((prev) => ({ ...prev, [event.messageId]: event.isStarred! }));
    }
    fetchStats();
  }, [fetchStats]);

  useMailSocket({
    onMailReceived: handleNewMail,
    onStateChanged: handleStateChanged,
  });

  // Action Handlers
  const handleToggleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) => ({ ...prev, [id]: checked }));
  };

  const handleToggleStar = async (id: string) => {
    const nextState = !starredIds[id];
    setStarredIds((prev) => ({ ...prev, [id]: nextState }));
    try {
      await rpcCall("mail", "updateState", {
        messageId: id,
        isStarred: nextState,
      });
    } catch {
      setStarredIds((prev) => ({ ...prev, [id]: !nextState }));
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Object.keys(checkedIds).filter((id) => checkedIds[id]);
    if (ids.length === 0) return;
    try {
      await rpcCall("mail", "delete", { messageIds: ids });
      setCheckedIds({});
      fetchMessages();
      fetchStats();
      showToast(`Moved ${ids.length} messages to Trash.`);
    } catch {
      showToast("Error deleting messages.");
    }
  };

  const handleMarkAsRead = async () => {
    const ids = Object.keys(checkedIds).filter((id) => checkedIds[id]);
    if (ids.length === 0) return;
    try {
      await Promise.all(
        ids.map((id) => rpcCall("mail", "updateState", { messageId: id, isRead: true }))
      );
      setMessages((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, isRead: true } : m))
      );
      setCheckedIds({});
      fetchStats();
      showToast(`Marked ${ids.length} messages as read.`);
    } catch {
      showToast("Error marking as read.");
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toast}
        </div>
      )}

      <PageBreadcrumb pageTitle="Inbox" />

      <div className="h-[calc(100vh-174px)] min-h-0 w-full min-w-0">
        <InboxLayout
          activeFolder={urlFolder}
          onSelectFolder={(f) => updateQuery({ folder: f, page: 1 })}
          activeLabel={urlLabel}
          onSelectLabel={(l) => updateQuery({ label: l, page: 1 })}
          counts={counts}
          onCompose={() => router.push("/inbox/new")}
        >
          <MailList
            emails={messages}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            checkedIds={checkedIds}
            starredIds={starredIds}
            onToggleCheck={handleToggleCheck}
            onToggleStar={handleToggleStar}
            onDeleteSelected={handleDeleteSelected}
            onMarkAsRead={handleMarkAsRead}
            onRefresh={() => {
              fetchMessages();
              fetchStats();
            }}
            onSelectMail={(id) => router.push(`/inbox/${id}`)}
            totalItems={messages.length}
          />
        </InboxLayout>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
