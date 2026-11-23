"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/layout/app-layout";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import {
  InboxLayout,
  MailDetails,
  MailList,
  type MailItem,
} from "@/components/support/email";
import type { MailDetailsData } from "@/components/support/email/mail-details/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "@/icons";
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

export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mailbox navigation & filter state
  const [folder, setFolder] = useState<string>("INBOX");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [messages, setMessages] = useState<MailItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Detail state
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({});
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<MailDetailsData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // Composer state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialTo, setComposeInitialTo] = useState("");
  const [composeInitialSubject, setComposeInitialSubject] = useState("");
  const [composeInitialBody, setComposeInitialBody] = useState("");

  // Raw EML Modal
  const [showRawEmlModal, setShowRawEmlModal] = useState(false);
  const [rawEmlContent, setRawEmlContent] = useState<string>("");
  const [copiedRawEml, setCopiedRawEml] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

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
          role: res.role,
          orgSlug: res.orgSlug,
          orgName: res.orgName,
          token,
        });
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 2. Fetch mailbox messages
  const fetchMailbox = useCallback(async () => {
    try {
      let folderParam = folder;
      let unreadOnly = false;
      let hasAttachments = false;

      if (folder === "unread") {
        folderParam = "INBOX";
        unreadOnly = true;
      } else if (folder === "attachments") {
        folderParam = "INBOX";
        hasAttachments = true;
      }

      const res = await rpcCall<any>("mail", "list", {
        folder: folderParam,
        query: searchQuery || undefined,
        unreadOnly: unreadOnly || undefined,
        limit: 100,
      });

      if (res && Array.isArray(res.messages)) {
        const mapped: MailItem[] = res.messages.map((m: any) => {
          let badge: "Important" | "Social" | "Promotional" | undefined = undefined;
          if (m.labels?.includes("vip") || m.labels?.includes("urgent")) {
            badge = "Important";
          }

          let dateStr = "Today";
          let timeStr = "";
          try {
            const d = new Date(m.date);
            timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const now = new Date();
            if (d.toDateString() === now.toDateString()) {
              dateStr = "Today";
            } else {
              dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
            }
          } catch {
            timeStr = m.date;
          }

          return {
            id: m.id,
            sender: m.from?.name || m.from?.address || "Unknown",
            email: m.from?.address || "",
            subject: m.subject || "(no subject)",
            content: m.snippet || "",
            time: timeStr || dateStr,
            date: dateStr,
            badge,
            isRead: Boolean(m.isRead),
            isStarred: Boolean(m.isStarred),
            attachments: m.hasAttachments ? [{ name: "attachment", type: "file", size: "", url: "" }] : undefined,
          };
        });

        // Filter by label if selected
        let finalMessages = mapped;
        if (activeLabel) {
          finalMessages = mapped.filter((m) => {
            const rawM = res.messages.find((rm: any) => rm.id === m.id);
            return rawM?.labels?.includes(activeLabel.toLowerCase());
          });
        }

        setMessages(finalMessages);

        // Update counts
        setCounts((prev) => ({
          ...prev,
          [folder]: res.unreadCount ?? res.total ?? finalMessages.length,
          INBOX: res.stats?.inboxUnread ?? res.unreadCount ?? prev["INBOX"] ?? 0,
          Starred: res.stats?.starred ?? prev["Starred"] ?? 0,
          Sent: res.stats?.sent ?? prev["Sent"] ?? 0,
          Drafts: res.stats?.drafts ?? prev["Drafts"] ?? 0,
          Trash: res.stats?.trash ?? prev["Trash"] ?? 0,
        }));
      }
    } catch (err: any) {
      console.error("Failed to load messages", err);
    }
  }, [folder, activeLabel, searchQuery]);

  // 3. Fetch single email detail
  const fetchMessageDetail = useCallback(async (msgId: string) => {
    setLoadingMessage(true);
    try {
      const res = await rpcCall<any>("mail", "get", { id: msgId });
      if (res && res.message) {
        const m = res.message;
        let dateStr = "";
        let timeStr = "";
        try {
          const d = new Date(m.date);
          timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          dateStr = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        } catch {
          dateStr = m.date;
        }

        const formattedAttachments = (m.attachments || []).map((att: any) => ({
          name: att.filename,
          type: att.contentType?.includes("pdf") ? "PDF" : "DOC",
          size: `${Math.max(1, Math.round(att.sizeBytes / 1024))} KB`,
          url: att.downloadUrl || `/rpc?namespace=mail&functionName=attachmentDownload&id=${att.id}`,
        }));

        const detailData: MailDetailsData = {
          id: m.id,
          sender: m.from?.name || m.from?.address || "Unknown",
          email: m.from?.address || "",
          subject: m.subject || "(no subject)",
          content: m.body?.snippet || m.body?.text || "",
          time: timeStr,
          date: dateStr,
          isRead: true,
          isStarred: Boolean(m.isStarred),
          spfResult: m.spfResult,
          dkimResult: m.dkimResult,
          dmarcResult: m.dmarcResult,
          html: m.body?.html,
          text: m.body?.text,
          rawEml: m.rawEml,
          attachments: formattedAttachments,
        };

        setActiveMessage(detailData);
        setSelectedMessageId(msgId);

        // Mark read in list
        setMessages((prev) =>
          prev.map((item) => (item.id === msgId ? { ...item, isRead: true } : item)),
        );
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load message.");
    } finally {
      setLoadingMessage(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!loading) {
      fetchMailbox();
    }
  }, [loading, fetchMailbox]);

  // WebSocket Live Updates
  useMailSocket({
    onMailReceived: (payload: MailEventPayload) => {
      showToast(`New message from ${payload.from?.name || payload.from?.address || "Sender"}`);
      fetchMailbox();
    },
    onStateChanged: () => {
      fetchMailbox();
    },
  });

  // Action handlers
  const handleToggleStar = async (msgId: string) => {
    const isCurrentlyStarred = Boolean(starredIds[msgId]);
    setStarredIds((prev) => ({ ...prev, [msgId]: !isCurrentlyStarred }));

    try {
      await rpcCall("mail", "batch", {
        messageIds: [msgId],
        action: isCurrentlyStarred ? "unstar" : "star",
      });
    } catch {
      // rollback on error
      setStarredIds((prev) => ({ ...prev, [msgId]: isCurrentlyStarred }));
    }
  };

  const handleToggleCheck = (msgId: string, checked: boolean) => {
    setCheckedIds((prev) => ({ ...prev, [msgId]: checked }));
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Object.keys(checkedIds).filter((id) => checkedIds[id]);
    if (idsToDelete.length === 0) return;

    try {
      await rpcCall("mail", "batch", {
        messageIds: idsToDelete,
        action: "delete",
      });
      showToast(`Moved ${idsToDelete.length} messages to Trash.`);
      setCheckedIds({});
      fetchMailbox();
    } catch (err: any) {
      showToast(err.message || "Failed to delete messages.");
    }
  };

  const handleMarkAsReadSelected = async () => {
    const ids = Object.keys(checkedIds).filter((id) => checkedIds[id]);
    if (ids.length === 0) return;

    try {
      await rpcCall("mail", "batch", {
        messageIds: ids,
        action: "read",
      });
      showToast(`Marked ${ids.length} messages as read.`);
      setCheckedIds({});
      fetchMailbox();
    } catch (err: any) {
      showToast(err.message || "Failed to mark as read.");
    }
  };

  const handleDeleteActiveMessage = async () => {
    if (!activeMessage) return;
    try {
      await rpcCall("mail", "batch", {
        messageIds: [activeMessage.id],
        action: "delete",
      });
      showToast("Message moved to Trash.");
      setActiveMessage(null);
      setSelectedMessageId(null);
      fetchMailbox();
    } catch (err: any) {
      showToast(err.message || "Failed to delete message.");
    }
  };

  const handleMarkActiveUnread = async () => {
    if (!activeMessage) return;
    try {
      await rpcCall("mail", "batch", {
        messageIds: [activeMessage.id],
        action: "unread",
      });
      showToast("Marked as unread.");
      setActiveMessage(null);
      setSelectedMessageId(null);
      fetchMailbox();
    } catch (err: any) {
      showToast(err.message || "Failed to mark as unread.");
    }
  };

  const handleArchiveActiveMessage = async () => {
    if (!activeMessage) return;
    try {
      await rpcCall("mail", "batch", {
        messageIds: [activeMessage.id],
        action: "archive",
      });
      showToast("Archived message.");
      setActiveMessage(null);
      setSelectedMessageId(null);
      fetchMailbox();
    } catch (err: any) {
      showToast(err.message || "Failed to archive message.");
    }
  };

  const handleViewRawEml = async () => {
    if (!activeMessage) return;
    try {
      const res = await rpcCall<any>("mail", "raw", { id: activeMessage.id });
      setRawEmlContent(res?.rawEml || activeMessage.rawEml || "No raw EML headers available.");
      setShowRawEmlModal(true);
    } catch {
      setRawEmlContent(activeMessage.rawEml || "No raw headers available.");
      setShowRawEmlModal(true);
    }
  };

  const handleReply = () => {
    if (!activeMessage) return;
    setComposeInitialTo(activeMessage.email);
    setComposeInitialSubject(`Re: ${activeMessage.subject}`);
    setComposeInitialBody(`\n\n--- Original Message ---\nFrom: ${activeMessage.sender} <${activeMessage.email}>\nDate: ${activeMessage.date}\nSubject: ${activeMessage.subject}\n\n${activeMessage.content}`);
    setIsComposeOpen(true);
  };

  const handleReplyAll = () => {
    if (!activeMessage) return;
    const allRecipients = [activeMessage.email];
    if (activeMessage.cc) {
      activeMessage.cc.forEach((c) => {
        if (c.address && !allRecipients.includes(c.address)) {
          allRecipients.push(c.address);
        }
      });
    }
    setComposeInitialTo(allRecipients.join(", "));
    setComposeInitialSubject(`Re: ${activeMessage.subject}`);
    setComposeInitialBody(`\n\n--- Original Message ---\nFrom: ${activeMessage.sender} <${activeMessage.email}>\nDate: ${activeMessage.date}\nSubject: ${activeMessage.subject}\n\n${activeMessage.content}`);
    setIsComposeOpen(true);
  };

  const handleForward = () => {
    if (!activeMessage) return;
    setComposeInitialTo("");
    setComposeInitialSubject(`Fwd: ${activeMessage.subject}`);
    setComposeInitialBody(`\n\n---------- Forwarded message ---------\nFrom: ${activeMessage.sender} <${activeMessage.email}>\nDate: ${activeMessage.date}\nSubject: ${activeMessage.subject}\nTo: ${user?.email}\n\n${activeMessage.content}`);
    setIsComposeOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            Connecting to sovereign inbox...
          </span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="w-full min-w-0">
        <PageBreadcrumb pageTitle={activeMessage ? "Message Details" : "Inbox"} />

        <div className="h-[calc(100vh-174px)] min-h-0 w-full min-w-0">
          <InboxLayout
            activeFolder={folder}
            onSelectFolder={(f) => {
              setFolder(f);
              setSelectedMessageId(null);
              setActiveMessage(null);
            }}
            activeLabel={activeLabel}
            onSelectLabel={(lbl) => {
              setActiveLabel(lbl);
              setSelectedMessageId(null);
              setActiveMessage(null);
            }}
            counts={counts}
            isComposeOpen={isComposeOpen}
            setIsComposeOpen={setIsComposeOpen}
            onCompose={() => {
              setComposeInitialTo("");
              setComposeInitialSubject("");
              setComposeInitialBody("");
              setIsComposeOpen(true);
            }}
            composeInitialTo={composeInitialTo}
            composeInitialSubject={composeInitialSubject}
            composeInitialBody={composeInitialBody}
            onComposeSent={() => {
              showToast("Message dispatched successfully.");
              fetchMailbox();
            }}
            maxSingleFileSizeBytes={user?.maxSingleFileSizeBytes}
            maxAttachmentCount={user?.maxAttachmentCount}
          >
            {/* If an email is selected, display full-width MailDetails */}
            {activeMessage ? (
              <MailDetails
                email={activeMessage}
                onBack={() => {
                  setActiveMessage(null);
                  setSelectedMessageId(null);
                }}
                onDelete={handleDeleteActiveMessage}
                onMarkUnread={handleMarkActiveUnread}
                onArchive={handleArchiveActiveMessage}
                onViewRawEml={handleViewRawEml}
                onReply={handleReply}
                onReplyAll={handleReplyAll}
                onForward={handleForward}
              />
            ) : (
              /* If no email selected, display full-width Gmail-style Table list */
              <MailList
                emails={messages}
                onSelectMail={fetchMessageDetail}
                checkedIds={checkedIds}
                starredIds={starredIds}
                onToggleCheck={handleToggleCheck}
                onToggleStar={handleToggleStar}
                onDeleteSelected={handleDeleteSelected}
                onMarkAsRead={handleMarkAsReadSelected}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalItems={messages.length}
              />
            )}
          </InboxLayout>
        </div>
      </div>

      {/* Raw EML Modal */}
      <Dialog open={showRawEmlModal} onOpenChange={setShowRawEmlModal}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Raw RFC 822 EML Message Headers
            </DialogTitle>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(rawEmlContent);
                setCopiedRawEml(true);
                setTimeout(() => setCopiedRawEml(false), 2000);
              }}
              className="gap-1.5"
            >
              {copiedRawEml ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
              {copiedRawEml ? "Copied" : "Copy Headers"}
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 rounded-xl border border-gray-200 bg-gray-900 p-4 font-mono text-xs text-gray-100 dark:border-gray-800">
            <pre className="whitespace-pre-wrap">{rawEmlContent}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
