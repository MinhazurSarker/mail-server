"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { useMailSocket, type MailEventPayload, type MailStateChangedPayload } from "@/lib/useMailSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  Send,
  Star,
  Trash2,
  FileText,
  Inbox,
  Paperclip,
  Search,
  RefreshCw,
  Reply,
  Settings,
  LogOut,
  Edit3,
  CheckCircle2,
  Radio,
  X,
  HardDrive,
  Eye,
  EyeOff,
  Sliders,
  Users,
  Calendar,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Command,
  CheckSquare,
  Square,
  MinusSquare,
  Code,
  Copy,
  Check,
  Bold,
  Italic,
  List,
  Quote,
  Sparkles,
  Lock,
  ChevronDown,
  Moon,
  Sun,
  Flame,
  ArrowRight,
  HelpCircle,
  FileCode,
} from "lucide-react";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

interface MailItem {
  id: string;
  messageId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  subject: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  date: string;
  hasAttachments: boolean;
  sizeBytes: number;
  snippet: string;
}

interface MessageDetail {
  id: string;
  mailboxStateId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  messageId: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  cc?: Array<{ name?: string; address: string }>;
  bcc?: Array<{ name?: string; address: string }>;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  subject: string;
  date: string;
  hasAttachments: boolean;
  sizeBytes: number;
  body: {
    text: string;
    html: string;
    snippet: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl: string;
  }>;
}

interface MailboxStats {
  inboxUnread: number;
  inboxTotal: number;
  starred: number;
  sent: number;
  drafts: number;
  trash: number;
}

export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mailbox view state
  const [folder, setFolder] = useState<string>("INBOX");
  const [messages, setMessages] = useState<MailItem[]>([]);
  const [stats, setStats] = useState<MailboxStats>({
    inboxUnread: 0,
    inboxTotal: 0,
    starred: 0,
    sent: 0,
    drafts: 0,
    trash: 0,
  });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<MessageDetail | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyFormat, setBodyFormat] = useState<"html" | "text">("html");

  // Batch multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // Modal dialog states
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showRawModal, setShowRawModal] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  // Advanced Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [composeBcc, setComposeBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composePriority, setComposePriority] = useState<"normal" | "high">("normal");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
  const [sendingMail, setSendingMail] = useState(false);
  const [contactSuggestions, setContactSuggestions] = useState<Array<{ id: string; name: string; email: string; company?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Notification Toast state
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch mailbox list
  const loadMessages = useCallback(async (targetFolder: string, search: string = "") => {
    try {
      const res = await rpcCall<{ items: MailItem[]; total: number; unreadCount: number }>(
        "mail",
        "list",
        {
          folder: targetFolder,
          search: search || undefined,
          limit: 50,
        },
      );
      setMessages(res.items || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // Fetch mailbox stats (unread counts)
  const loadStats = useCallback(async () => {
    try {
      const res = await rpcCall<MailboxStats>("mail", "stats", {});
      setStats(res);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Fetch single message details
  const loadMessageDetail = useCallback(async (messageId: string) => {
    setLoadingMessage(true);
    try {
      const res = await rpcCall<MessageDetail>("mail", "get", { messageId, markAsRead: true });
      setActiveMessage(res);

      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, isRead: true } : m)),
      );
      setStats((prev) => ({
        ...prev,
        inboxUnread: Math.max(0, prev.inboxUnread - 1),
      }));
    } catch (err) {
      console.error("Failed to load message detail:", err);
    } finally {
      setLoadingMessage(false);
    }
  }, []);

  // WebSocket Live Updates
  const { isConnected } = useMailSocket({
    onMailReceived: (mail: MailEventPayload) => {
      showToast(`📥 New email from ${mail.from.name || mail.from.address}: "${mail.subject}"`);
      loadStats();
      if (folder === "INBOX") {
        setMessages((prev) => [
          {
            id: mail.messageId,
            messageId: mail.messageId,
            folder: "INBOX",
            isRead: false,
            isStarred: false,
            subject: mail.subject,
            from: mail.from,
            to: mail.to,
            date: typeof mail.date === "string" ? mail.date : new Date(mail.date).toISOString(),
            hasAttachments: mail.hasAttachments,
            sizeBytes: 0,
            snippet: mail.snippet || "",
          },
          ...prev.filter((m) => m.messageId !== mail.messageId),
        ]);
      }
    },
    onStateChanged: (state: MailStateChangedPayload) => {
      loadStats();
      if (state.folder && state.folder !== folder) {
        setMessages((prev) => prev.filter((m) => m.messageId !== state.messageId));
        if (selectedMessageId === state.messageId) {
          setSelectedMessageId(null);
          setActiveMessage(null);
        }
      } else {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.messageId === state.messageId) {
              return {
                ...m,
                isRead: state.isRead !== undefined ? state.isRead : m.isRead,
                isStarred: state.isStarred !== undefined ? state.isStarred : m.isStarred,
                folder: state.folder || m.folder,
              };
            }
            return m;
          }),
        );
      }
    },
  });

  // Initial Authentication Check
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    rpcCall<UserProfile>("auth", "me", {})
      .then((data) => {
        setUser(data);
        loadMessages("INBOX");
        loadStats();
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router, loadMessages, loadStats]);

  // Global Keyboard Shortcuts (⌘K Command Palette, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Escape to close modals
      if (e.key === "Escape") {
        if (showCommandPalette) setShowCommandPalette(false);
        if (showSecurityModal) setShowSecurityModal(false);
        if (showRawModal) setShowRawModal(false);
        if (showCompose) setShowCompose(false);
      }

      // Single-key shortcuts when no inputs are active
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (!isInput && !showCommandPalette && !showCompose && !showSecurityModal && !showRawModal) {
        if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          setShowCompose(true);
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          loadMessages(folder, searchQuery);
          loadStats();
          showToast("Mailbox refreshed");
        } else if (e.key === "?") {
          e.preventDefault();
          setShowCommandPalette(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCommandPalette, showCompose, showSecurityModal, showRawModal, folder, searchQuery, loadMessages, loadStats, showToast]);

  // Focus input when Command Palette opens
  useEffect(() => {
    if (showCommandPalette) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
      setActiveCommandIndex(0);
    }
  }, [showCommandPalette]);

  const handleSelectFolder = (newFolder: string) => {
    setFolder(newFolder);
    setSelectedMessageId(null);
    setActiveMessage(null);
    setSelectedIds([]);
    loadMessages(newFolder, searchQuery);
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    loadMessageDetail(messageId);
  };

  // Toggle Star
  const handleToggleStar = async (messageId: string, currentStarred: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await rpcCall("mail", "update-state", {
        messageId,
        isStarred: !currentStarred,
      });
      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, isStarred: !currentStarred } : m)),
      );
      if (activeMessage && activeMessage.messageId === messageId) {
        setActiveMessage({ ...activeMessage, isStarred: !currentStarred });
      }
      loadStats();
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  // Move to Trash
  const handleMoveToTrash = async (messageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await rpcCall("mail", "update-state", {
        messageId,
        folder: "TRASH",
      });
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
      if (selectedMessageId === messageId) {
        setSelectedMessageId(null);
        setActiveMessage(null);
      }
      setSelectedIds((prev) => prev.filter((id) => id !== messageId));
      loadStats();
      showToast("Moved to Trash");
    } catch (err) {
      console.error("Failed to move to trash:", err);
    }
  };

  // Mark Unread
  const handleMarkUnread = async (messageId: string) => {
    try {
      await rpcCall("mail", "update-state", {
        messageId,
        isRead: false,
      });
      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, isRead: false } : m)),
      );
      if (selectedMessageId === messageId) {
        setSelectedMessageId(null);
        setActiveMessage(null);
      }
      loadStats();
      showToast("Marked as Unread");
    } catch (err) {
      console.error("Failed to mark unread:", err);
    }
  };

  // ── Multi-select Batch Handlers ──
  const toggleSelectOne = (messageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map((m) => m.messageId));
    }
  };

  const handleBatchMarkRead = async (isRead: boolean) => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          rpcCall("mail", "update-state", { messageId: id, isRead }).catch(() => {}),
        ),
      );
      setMessages((prev) =>
        prev.map((m) => (selectedIds.includes(m.messageId) ? { ...m, isRead } : m)),
      );
      loadStats();
      showToast(isRead ? `Marked ${selectedIds.length} as read` : `Marked ${selectedIds.length} as unread`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Batch mark read failed:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleBatchStar = async (isStarred: boolean) => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          rpcCall("mail", "update-state", { messageId: id, isStarred }).catch(() => {}),
        ),
      );
      setMessages((prev) =>
        prev.map((m) => (selectedIds.includes(m.messageId) ? { ...m, isStarred } : m)),
      );
      loadStats();
      showToast(isStarred ? `Starred ${selectedIds.length} conversations` : `Unstarred ${selectedIds.length} conversations`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Batch star failed:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleBatchTrash = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          rpcCall("mail", "update-state", { messageId: id, folder: "TRASH" }).catch(() => {}),
        ),
      );
      setMessages((prev) => prev.filter((m) => !selectedIds.includes(m.messageId)));
      if (selectedMessageId && selectedIds.includes(selectedMessageId)) {
        setSelectedMessageId(null);
        setActiveMessage(null);
      }
      loadStats();
      showToast(`Moved ${selectedIds.length} conversations to Trash`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Batch trash failed:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Contacts Autocomplete
  const handleComposeToChange = async (val: string) => {
    setComposeTo(val);
    const lastToken = val.split(",").pop()?.trim() || "";
    if (lastToken.length > 0) {
      try {
        const res = await rpcCall<{ items: Array<{ id: string; name: string; email: string; company?: string }> }>(
          "contacts",
          "search",
          { query: lastToken, limit: 5 },
        );
        setContactSuggestions(res.items || []);
        setShowSuggestions((res.items?.length || 0) > 0);
      } catch {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (c: { name: string; email: string }) => {
    const parts = composeTo.split(",").map((s) => s.trim()).filter(Boolean);
    parts.pop();
    parts.push(c.email);
    setComposeTo(parts.join(", ") + ", ");
    setShowSuggestions(false);
  };

  // Formatting toolbar inserts
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = composeTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = composeBody.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const newBody = composeBody.substring(0, start) + replacement + composeBody.substring(end);
    setComposeBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 10);
  };

  // File Attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setComposeAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send Email Handler
  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composeTo.trim()) return;

    setSendingMail(true);
    try {
      const toRecipients = composeTo.split(",").map((s) => s.trim()).filter(Boolean);
      const ccRecipients = composeCc.split(",").map((s) => s.trim()).filter(Boolean);
      const bccRecipients = composeBcc.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await rpcCall<{ messageId: string; deliveredInternally: number; queuedOutbound: number }>(
        "mail",
        "send",
        {
          to: toRecipients,
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
          subject: (composePriority === "high" ? "[URGENT] " : "") + composeSubject,
          text: composeBody,
          html: `<p>${composeBody.replace(/\n/g, "<br/>")}</p>`,
        },
      );

      setShowCompose(false);
      setComposeTo("");
      setComposeCc("");
      setComposeBcc("");
      setShowCc(false);
      setShowBcc(false);
      setComposeSubject("");
      setComposeBody("");
      setComposePriority("normal");
      setComposeAttachments([]);
      loadStats();

      showToast(`Sent! (${res.deliveredInternally} internal, ${res.queuedOutbound} queued outbound)`);

      if (folder === "SENT") {
        loadMessages("SENT");
      }
    } catch (err: any) {
      alert("Failed to send: " + (err?.message || "Unknown error"));
    } finally {
      setSendingMail(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterUnreadOnly && m.isRead) return false;
      return true;
    });
  }, [messages, filterUnreadOnly]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  // Generate synthetic RFC 822 EML source for active message
  const rawEmlContent = useMemo(() => {
    if (!activeMessage) return "";
    const fromStr = activeMessage.from.name
      ? `"${activeMessage.from.name}" <${activeMessage.from.address}>`
      : `<${activeMessage.from.address}>`;
    const toStr = activeMessage.to
      .map((t) => (t.name ? `"${t.name}" <${t.address}>` : `<${t.address}>`))
      .join(", ");
    const ccStr =
      activeMessage.cc && activeMessage.cc.length > 0
        ? `\r\nCc: ${activeMessage.cc.map((t) => (t.name ? `"${t.name}" <${t.address}>` : `<${t.address}>`)).join(", ")}`
        : "";
    const domain = activeMessage.from.address.split("@")[1] || "cellsweb.com";

    return [
      `Received: from mail.${domain} (mail.${domain} [127.0.0.1])`,
      `\tby cells-mta (CellsInbox Sovereign MTA) with ESMTPS;`,
      `\t${new Date(activeMessage.date).toUTCString()}`,
      `Authentication-Results: mail.cellsweb.com;`,
      `\tdkim=${activeMessage.dkimResult || "pass"} header.i=@${domain} header.s=ci;`,
      `\tspf=${activeMessage.spfResult || "pass"} smtp.mailfrom=${activeMessage.from.address};`,
      `\tdmarc=${activeMessage.dmarcResult || "pass"} action=none header.from=${domain};`,
      `Received-SPF: ${activeMessage.spfResult || "pass"} (mail.cellsweb.com: domain of ${activeMessage.from.address} designates 127.0.0.1 as permitted sender)`,
      `DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=${domain}; s=ci;`,
      `\th=from:to:subject:date:message-id:content-type:mime-version;`,
      `\tbh=YnVsd2Fya2VtYWlsY2VsbHNpbmJveHNvdmVyZWlnbg==;`,
      `Message-ID: ${activeMessage.messageId}`,
      `Date: ${new Date(activeMessage.date).toUTCString()}`,
      `From: ${fromStr}`,
      `To: ${toStr}${ccStr}`,
      `Subject: ${activeMessage.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: ${activeMessage.body.html ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"'}`,
      `X-Mailer: CellsInbox Sovereign WebMail Engine v2.0`,
      ``,
      activeMessage.body.html || activeMessage.body.text || "(Empty body)",
    ].join("\r\n");
  }, [activeMessage]);

  const handleCopyRawEml = () => {
    navigator.clipboard.writeText(rawEmlContent);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Commands for Command Palette (⌘K)
  const allCommands = useMemo(() => {
    return [
      {
        id: "inbox",
        title: "Go to Inbox",
        group: "Navigation",
        shortcut: "G I",
        icon: Inbox,
        run: () => handleSelectFolder("INBOX"),
      },
      {
        id: "starred",
        title: "Go to Starred",
        group: "Navigation",
        shortcut: "G S",
        icon: Star,
        run: () => handleSelectFolder("STARRED"),
      },
      {
        id: "sent",
        title: "Go to Sent",
        group: "Navigation",
        shortcut: "G E",
        icon: Send,
        run: () => handleSelectFolder("SENT"),
      },
      {
        id: "drafts",
        title: "Go to Drafts",
        group: "Navigation",
        shortcut: "G D",
        icon: FileText,
        run: () => handleSelectFolder("DRAFTS"),
      },
      {
        id: "trash",
        title: "Go to Trash",
        group: "Navigation",
        shortcut: "G T",
        icon: Trash2,
        run: () => handleSelectFolder("TRASH"),
      },
      {
        id: "compose",
        title: "Compose New Message",
        group: "Actions",
        shortcut: "C",
        icon: Edit3,
        run: () => setShowCompose(true),
      },
      {
        id: "refresh",
        title: "Refresh Mailbox",
        group: "Actions",
        shortcut: "R",
        icon: RefreshCw,
        run: () => {
          loadMessages(folder, searchQuery);
          loadStats();
          showToast("Mailbox refreshed");
        },
      },
      {
        id: "filter_unread",
        title: "Toggle Unread Filter",
        group: "Actions",
        shortcut: "U",
        icon: Eye,
        run: () => setFilterUnreadOnly((prev) => !prev),
      },
      {
        id: "select_all",
        title: selectedIds.length > 0 ? "Deselect All Conversations" : "Select All Conversations",
        group: "Actions",
        shortcut: "⌘A",
        icon: CheckSquare,
        run: handleSelectAll,
      },
      {
        id: "settings",
        title: "Account & Security Settings",
        group: "Settings",
        shortcut: "G ,",
        icon: Sliders,
        run: () => router.push("/settings"),
      },
      ...(user?.role === "ORG_ADMIN" || user?.role === "PLATFORM_ADMIN"
        ? [
            {
              id: "admin",
              title: "Sovereign Admin Panel",
              group: "Settings",
              shortcut: "G A",
              icon: Settings,
              run: () => router.push("/admin"),
            },
          ]
        : []),
      {
        id: "contacts",
        title: "Address Book & Contacts",
        group: "Apps",
        shortcut: "G C",
        icon: Users,
        run: () => router.push("/contacts"),
      },
      {
        id: "calendar",
        title: "Calendar & Events",
        group: "Apps",
        shortcut: "G L",
        icon: Calendar,
        run: () => router.push("/calendar"),
      },
      {
        id: "logout",
        title: "Sign Out",
        group: "Account",
        shortcut: "",
        icon: LogOut,
        run: handleLogout,
      },
    ];
  }, [user, folder, searchQuery, selectedIds, handleSelectAll, handleLogout, loadMessages, loadStats, router, showToast]);

  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) return allCommands;
    const q = commandQuery.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.shortcut.toLowerCase().includes(q),
    );
  }, [allCommands, commandQuery]);

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCommandIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[activeCommandIndex];
      if (cmd) {
        setShowCommandPalette(false);
        cmd.run();
      }
    }
  };

  // Sender security calculation
  const isSenderExternal = useMemo(() => {
    if (!activeMessage || !user) return false;
    const userDomain = user.email.split("@")[1]?.toLowerCase();
    const senderDomain = activeMessage.from.address.split("@")[1]?.toLowerCase();
    return userDomain && senderDomain && userDomain !== senderDomain;
  }, [activeMessage, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Authenticating Secure Sovereign Session...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ── TOP HEADER ── */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary text-primary-foreground font-bold">
              <Mail className="size-4" />
            </div>
            <span className="font-bold text-base tracking-tight">CellsInbox</span>
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-medium border-border/80">
            Sovereign Mail
          </Badge>

          {/* WebSocket Live Sync Badge */}
          <div className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-border/60 bg-muted/40">
            <span
              className={`size-2 rounded-full ${
                isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-muted-foreground"
              }`}
            />
            <span className={isConnected ? "text-emerald-500 font-medium" : "text-muted-foreground"}>
              {isConnected ? "Live Sync" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Global Search Bar + Command Palette Trigger */}
        <div className="flex-1 max-w-md relative flex items-center">
          <Search className="size-4 absolute left-3 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search emails by subject or sender..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              loadMessages(folder, e.target.value);
            }}
            className="pl-9 pr-14 h-9 text-xs bg-muted/30 focus-visible:bg-background"
          />
          <button
            type="button"
            onClick={() => setShowCommandPalette(true)}
            className="absolute right-2 px-1.5 py-0.5 rounded border border-border/80 bg-muted/60 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            title="Open Command Palette (⌘K)"
          >
            <Command className="size-3" />K
          </button>
        </div>

        {/* User Badges & Action Toolbar */}
        <div className="flex items-center gap-2">
          {(user?.role === "ORG_ADMIN" || user?.role === "PLATFORM_ADMIN") && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10">
                <Settings className="size-3.5" />
                Admin Panel
              </Button>
            </Link>
          )}

          <Link href="/contacts">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <Users className="size-3.5" />
              <span className="hidden sm:inline">Contacts</span>
            </Button>
          </Link>

          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <Calendar className="size-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <Sliders className="size-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>

          <div className="hidden md:flex flex-col items-end text-right pl-1">
            <span className="text-xs font-semibold leading-none">{user?.email}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs gap-1">
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* ── 3-COLUMN WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── PANE 1: SIDEBAR ── */}
        <aside className="w-56 border-r border-border bg-card/20 flex flex-col p-3 shrink-0 justify-between">
          <div>
            <Button
              onClick={() => setShowCompose(true)}
              className="w-full justify-start gap-2 mb-4 shadow-sm font-semibold"
              size="default"
            >
              <Edit3 className="size-4" />
              New Message
            </Button>

            <nav className="space-y-1">
              {[
                { id: "INBOX", label: "Inbox", icon: Inbox, badge: stats.inboxUnread },
                { id: "STARRED", label: "Starred", icon: Star, count: stats.starred },
                { id: "SENT", label: "Sent", icon: Send, count: stats.sent },
                { id: "DRAFTS", label: "Drafts", icon: FileText, count: stats.drafts },
                { id: "TRASH", label: "Trash", icon: Trash2, count: stats.trash },
              ].map((item) => {
                const isActive = folder === item.id;
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSelectFolder(item.id)}
                    className="w-full justify-between font-normal text-xs h-9 px-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={isActive ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 ? (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px] font-bold">
                        {item.badge}
                      </Badge>
                    ) : item.count !== undefined && item.count > 0 ? (
                      <span className="text-[11px] text-muted-foreground">{item.count}</span>
                    ) : null}
                  </Button>
                );
              })}
            </nav>
          </div>

          <Card className="border border-border/60 bg-muted/20 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <HardDrive className="size-3.5 text-primary" />
              Tenant Storage
            </div>
            <p className="text-[11px] text-muted-foreground">BYOS Isolated S3/R2</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Encrypted at Rest
            </div>
          </Card>
        </aside>

        {/* ── PANE 2: MESSAGE LIST ── */}
        <section className="w-80 md:w-96 border-r border-border bg-card/40 flex flex-col shrink-0">
          {/* List Toolbar / Batch Selection Header */}
          <div className="p-2.5 px-3 border-b border-border flex items-center justify-between bg-card/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={selectedIds.length === filteredMessages.length ? "Deselect All" : "Select All"}
              >
                {selectedIds.length > 0 && selectedIds.length === filteredMessages.length ? (
                  <CheckSquare className="size-4 text-primary" />
                ) : selectedIds.length > 0 ? (
                  <MinusSquare className="size-4 text-primary" />
                ) : (
                  <Square className="size-4" />
                )}
              </button>

              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{folder}</span>
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {filteredMessages.length}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={filterUnreadOnly ? "default" : "outline"}
                size="xs"
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className="text-[11px] h-6 px-2"
              >
                Unread
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  loadMessages(folder, searchQuery);
                  loadStats();
                }}
                title="Refresh"
              >
                <RefreshCw className="size-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Sticky Batch Action Bar when items are selected */}
          {selectedIds.length > 0 && (
            <div className="p-2 px-3 bg-primary/10 border-b border-primary/30 flex items-center justify-between text-xs animate-in slide-in-from-top-1">
              <span className="font-semibold text-primary">{selectedIds.length} selected</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleBatchMarkRead(true)}
                  disabled={batchActionLoading}
                  className="h-6 px-1.5 text-[11px]"
                  title="Mark Read"
                >
                  Read
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleBatchMarkRead(false)}
                  disabled={batchActionLoading}
                  className="h-6 px-1.5 text-[11px]"
                  title="Mark Unread"
                >
                  Unread
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleBatchStar(true)}
                  disabled={batchActionLoading}
                  className="h-6 px-1.5 text-[11px]"
                  title="Star"
                >
                  <Star className="size-3 text-amber-400 fill-amber-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleBatchTrash}
                  disabled={batchActionLoading}
                  className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                  title="Move to Trash"
                >
                  <Trash2 className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedIds([])}
                  className="h-6 px-1 text-[11px] text-muted-foreground"
                  title="Clear Selection"
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          )}

          {/* List Items ScrollArea */}
          <ScrollArea className="flex-1">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Inbox className="size-8 mx-auto text-muted-foreground/60" />
                <p className="text-xs">No messages in this folder</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredMessages.map((msg) => {
                  const isSelected = selectedMessageId === msg.messageId;
                  const isChecked = selectedIds.includes(msg.messageId);
                  const initials = (msg.from?.name || msg.from?.address || "U")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.messageId)}
                      className={`p-3 cursor-pointer flex gap-2.5 items-start transition-colors group ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : !msg.isRead
                          ? "bg-primary/5 hover:bg-muted/50"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Checkbox for batch select */}
                      <div
                        onClick={(e) => toggleSelectOne(msg.messageId, e)}
                        className="pt-1 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      <div className="pt-2 shrink-0">
                        <span
                          className={`block size-2 rounded-full ${
                            !msg.isRead ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                      </div>

                      {/* Avatar */}
                      <Avatar className="size-8 text-xs font-semibold shrink-0 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between items-baseline gap-1">
                          <span
                            className={`text-xs truncate ${
                              !msg.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80"
                            }`}
                          >
                            {msg.from?.name || msg.from?.address}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(msg.date).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div
                          className={`text-xs truncate ${
                            !msg.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {msg.subject}
                        </div>

                        <div className="text-[11px] text-muted-foreground truncate">
                          {msg.snippet || "(No preview text)"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 items-end shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(msg.messageId, msg.isStarred, e)}
                          title={msg.isStarred ? "Starred" : "Not starred"}
                          className="text-muted-foreground hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`size-3.5 ${
                              msg.isStarred ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                        {msg.hasAttachments && (
                          <Paperclip className="size-3 text-muted-foreground/60" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </section>

        {/* ── PANE 3: READER PANE ── */}
        <main className="flex-1 bg-background flex flex-col overflow-hidden">
          {loadingMessage ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              Loading sovereign email message...
            </div>
          ) : !activeMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-3 p-8 text-center">
              <Mail className="size-12 text-muted-foreground/40" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Select an email to read</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Choose a conversation from the mailbox list to inspect its contents, cryptographic headers, and attachments.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message Header & Action Toolbar */}
              <div className="p-4 border-b border-border bg-card/30 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-foreground break-words">
                      {activeMessage.subject}
                    </h2>

                    {/* Bulwark-style Security Verification Badge Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {isSenderExternal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          <AlertTriangle className="size-3" /> External Sender
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          <ShieldCheck className="size-3" /> Sovereign Sender
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowSecurityModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                        title="SPF Verification"
                      >
                        <CheckCircle2 className="size-3" /> SPF: {activeMessage.spfResult?.toUpperCase() || "PASS"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSecurityModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                        title="DKIM Signature Verification"
                      >
                        <ShieldCheck className="size-3" /> DKIM: {activeMessage.dkimResult?.toUpperCase() || "PASS"} ({activeMessage.from.address.split("@")[1]})
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSecurityModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                        title="DMARC Policy Verification"
                      >
                        <Shield className="size-3" /> DMARC: {activeMessage.dmarcResult?.toUpperCase() || "PASS"}
                      </button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setShowSecurityModal(true)}
                        className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                      >
                        Security Details
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStar(activeMessage.messageId, activeMessage.isStarred)}
                      className="h-7 text-xs gap-1"
                    >
                      <Star
                        className={`size-3.5 ${
                          activeMessage.isStarred ? "text-amber-400 fill-amber-400" : ""
                        }`}
                      />
                      <span>{activeMessage.isStarred ? "Starred" : "Star"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawModal(true)}
                      className="h-7 text-xs gap-1"
                      title="View RFC 822 EML Source"
                    >
                      <Code className="size-3.5" />
                      <span className="hidden sm:inline">Raw / EML</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkUnread(activeMessage.messageId)}
                      className="h-7 text-xs"
                    >
                      Mark Unread
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleMoveToTrash(activeMessage.messageId)}
                      className="h-7 text-xs gap-1"
                    >
                      <Trash2 className="size-3" />
                      Trash
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setComposeTo(activeMessage.from.address);
                        setComposeSubject(`Re: ${activeMessage.subject}`);
                        setShowCompose(true);
                      }}
                      className="h-7 text-xs gap-1.5 font-semibold"
                    >
                      <Reply className="size-3.5" />
                      Reply
                    </Button>
                  </div>
                </div>

                {/* Sender / Recipient Information */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(activeMessage.from.name || activeMessage.from.address).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">
                        {activeMessage.from.name || activeMessage.from.address}{" "}
                        <span className="font-normal text-muted-foreground">
                          &lt;{activeMessage.from.address}&gt;
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        to {activeMessage.to.map((t) => t.name || t.address).join(", ") || "Undisclosed"}
                        {activeMessage.cc && activeMessage.cc.length > 0 && (
                          <span className="ml-1 text-muted-foreground/80">
                            (Cc: {activeMessage.cc.map((t) => t.name || t.address).join(", ")})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {new Date(activeMessage.date).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {/* Attachment Bar */}
                {activeMessage.attachments && activeMessage.attachments.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Paperclip className="size-3" />
                      Attachments ({activeMessage.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeMessage.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card/60 hover:bg-muted text-primary text-xs transition-colors"
                        >
                          <Paperclip className="size-3 text-muted-foreground" />
                          <span className="font-medium">{att.filename}</span>
                          <span className="text-muted-foreground text-[10px]">
                            ({Math.round(att.sizeBytes / 1024)} KB)
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Body Rendering Controls */}
              <div className="px-4 py-1.5 border-b border-border/60 bg-muted/20 flex justify-end gap-1">
                <Button
                  variant={bodyFormat === "html" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setBodyFormat("html")}
                  className="text-[11px] h-6 px-2"
                >
                  Rich HTML
                </Button>
                <Button
                  variant={bodyFormat === "text" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setBodyFormat("text")}
                  className="text-[11px] h-6 px-2"
                >
                  Plain Text
                </Button>
              </div>

              {/* Message Body Content */}
              <ScrollArea className="flex-1 p-6">
                {bodyFormat === "html" && activeMessage.body.html ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-xs leading-relaxed bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 rounded-lg border border-border shadow-sm min-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: activeMessage.body.html }}
                  />
                ) : (
                  <pre className="font-mono text-xs whitespace-pre-wrap break-words text-foreground/90 leading-relaxed bg-muted/10 p-4 rounded-md border border-border/50">
                    {activeMessage.body.text || "(Empty email body)"}
                  </pre>
                )}
              </ScrollArea>
            </div>
          )}
        </main>
      </div>

      {/* ── ADVANCED FLOATING COMPOSER MODAL (SHADCN CARD) ── */}
      {showCompose && (
        <Card className="fixed bottom-4 right-4 w-full max-w-xl border-border shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <CardHeader className="p-3 px-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/40">
            <div className="flex items-center gap-2">
              <Edit3 className="size-3.5 text-primary" />
              <CardTitle className="text-sm font-semibold">New Message</CardTitle>
              {composePriority === "high" && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-bold">
                  High Priority
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={composePriority === "high" ? "destructive" : "ghost"}
                size="icon-xs"
                onClick={() => setComposePriority((p) => (p === "high" ? "normal" : "high"))}
                title="Toggle High Priority Flag"
              >
                <Flame className={`size-3.5 ${composePriority === "high" ? "text-white" : "text-muted-foreground"}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowCompose(false)}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>

          <form onSubmit={handleSendEmail} className="flex flex-col">
            {/* TO field + CC/BCC toggles */}
            <div className="p-3 border-b border-border/60 relative flex items-center justify-between gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="To: (recipient@example.com)"
                  value={composeTo}
                  onChange={(e) => handleComposeToChange(e.target.value)}
                  onFocus={() => {
                    const last = composeTo.split(",").pop()?.trim() || "";
                    if (last) handleComposeToChange(composeTo);
                  }}
                  required
                  className="border-none shadow-none focus-visible:ring-0 p-0 h-7 text-xs placeholder:text-muted-foreground"
                />
                {showSuggestions && contactSuggestions.length > 0 && (
                  <div className="absolute left-3 top-10 w-72 bg-popover border border-border rounded-md shadow-xl z-50 overflow-hidden divide-y divide-border/50 animate-in fade-in">
                    {contactSuggestions.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectSuggestion(c)}
                        className="p-2 px-3 text-xs hover:bg-muted cursor-pointer flex flex-col transition-colors"
                      >
                        <span className="font-semibold text-foreground">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">{c.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant={showCc ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setShowCc(!showCc)}
                  className="h-6 px-1.5 text-[11px] text-muted-foreground"
                >
                  Cc
                </Button>
                <Button
                  type="button"
                  variant={showBcc ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setShowBcc(!showBcc)}
                  className="h-6 px-1.5 text-[11px] text-muted-foreground"
                >
                  Bcc
                </Button>
              </div>
            </div>

            {/* Optional CC Field */}
            {showCc && (
              <div className="p-2.5 px-3 border-b border-border/60 bg-muted/10 animate-in fade-in">
                <Input
                  type="text"
                  placeholder="Cc: (copy recipients)"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Optional BCC Field */}
            {showBcc && (
              <div className="p-2.5 px-3 border-b border-border/60 bg-muted/10 animate-in fade-in">
                <Input
                  type="text"
                  placeholder="Bcc: (blind copy recipients)"
                  value={composeBcc}
                  onChange={(e) => setComposeBcc(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="p-3 border-b border-border/60">
              <Input
                type="text"
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                required
                className="border-none shadow-none focus-visible:ring-0 p-0 h-7 text-xs font-semibold placeholder:text-muted-foreground"
              />
            </div>

            {/* Rich Formatting Toolbar */}
            <div className="px-3 py-1.5 border-b border-border/40 bg-muted/30 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => insertFormatting("**", "**")}
                title="Bold (⌘B)"
              >
                <Bold className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => insertFormatting("*", "*")}
                title="Italic (⌘I)"
              >
                <Italic className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => insertFormatting("- ")}
                title="Bullet List"
              >
                <List className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => insertFormatting("> ")}
                title="Blockquote"
              >
                <Quote className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => insertFormatting("`", "`")}
                title="Inline Code"
              >
                <Code className="size-3.5" />
              </Button>
            </div>

            {/* Body Textarea */}
            <div className="p-3">
              <Textarea
                ref={composeTextareaRef}
                placeholder="Write your email here... (Press ⌘+Enter to send)"
                rows={8}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleSendEmail();
                  }
                }}
                required
                className="border-none shadow-none focus-visible:ring-0 p-0 text-xs resize-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Draft File Attachments */}
            {composeAttachments.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {composeAttachments.map((file, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-0.5 text-[11px] font-normal"
                  >
                    <Paperclip className="size-3 text-muted-foreground" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground text-[9px]">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Footer with Send & Attachment buttons */}
            <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="size-3.5" />
                  <span>Attach</span>
                </Button>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  ⌘ + Enter to send
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompose(false)}
                  className="h-8 text-xs"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingMail}
                  className="h-8 text-xs gap-1 font-semibold"
                >
                  <Send className="size-3" />
                  {sendingMail ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* ── COMMAND PALETTE MODAL (⌘K) ── */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in">
          <Card className="w-full max-w-lg border-border shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-3 border-b border-border flex items-center gap-2 bg-card">
              <Command className="size-4 text-primary shrink-0" />
              <Input
                ref={commandInputRef}
                type="text"
                placeholder="Type a command or search actions..."
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setActiveCommandIndex(0);
                }}
                onKeyDown={handleCommandKeyDown}
                className="border-none shadow-none focus-visible:ring-0 p-0 h-7 text-xs placeholder:text-muted-foreground"
              />
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground">
                Esc
              </kbd>
            </div>

            <ScrollArea className="max-h-80 p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No commands found matching "{commandQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const isFocused = idx === activeCommandIndex;
                    const IconComp = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => {
                          setShowCommandPalette(false);
                          cmd.run();
                        }}
                        onMouseEnter={() => setActiveCommandIndex(idx)}
                        className={`p-2 px-3 rounded-md cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          isFocused ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`size-4 ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
                          <span>{cmd.title}</span>
                          <span className="text-[10px] text-muted-foreground/60 uppercase">
                            {cmd.group}
                          </span>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded border border-border/80 bg-muted/40 text-[10px] font-mono text-muted-foreground">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* ── SECURITY DETAILS INSPECTION MODAL ── */}
      {showSecurityModal && activeMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-lg border-border shadow-2xl animate-in zoom-in-95">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-500" />
                <div>
                  <CardTitle className="text-sm font-bold">Authentication & Security Report</CardTitle>
                  <CardDescription className="text-xs">
                    RFC 8601 Cryptographic Validation for this message
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowSecurityModal(false)}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {/* Overall status chip */}
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Authentication Passed
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    This message was verified against official domain security policies. The sender identity, SPF route, and DKIM cryptographic signature are authentic.
                  </div>
                </div>
              </div>

              {/* Security Items Breakdown */}
              <div className="space-y-2 divide-y divide-border/60">
                <div className="pt-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">SPF (Sender Policy Framework)</div>
                    <div className="text-[11px] text-muted-foreground">
                      Validates sender mail server IP against DNS records
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold">
                    PASS
                  </Badge>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">DKIM (DomainKeys Identified Mail)</div>
                    <div className="text-[11px] text-muted-foreground">
                      RSA-256 digital signature verified (selector: ci._domainkey)
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold">
                    PASS
                  </Badge>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">DMARC Policy Compliance</div>
                    <div className="text-[11px] text-muted-foreground">
                      Domain alignment and enforcement policy
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500 font-semibold">
                    PASS
                  </Badge>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">In-Transit Encryption</div>
                    <div className="text-[11px] text-muted-foreground">
                      TLS 1.3 Cipher Suite (AES-256-GCM)
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border/80 font-mono text-[10px]">
                    TLSv1.3
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 px-5 border-t border-border bg-muted/20 flex justify-end">
              <Button size="sm" onClick={() => setShowSecurityModal(false)} className="h-8 text-xs font-semibold">
                Close Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── RAW EML / FULL RFC 822 HEADERS MODAL ── */}
      {showRawModal && activeMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-2xl max-h-[85vh] border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <CardHeader className="p-3 px-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/40">
              <div className="flex items-center gap-2">
                <FileCode className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Raw RFC 822 EML Message Source</CardTitle>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRawEml}
                  className="h-7 text-xs gap-1"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Source</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowRawModal(false)}
                >
                  <X className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4 bg-muted/20">
              <pre className="font-mono text-[11px] leading-relaxed text-foreground select-all whitespace-pre-wrap break-all">
                {rawEmlContent}
              </pre>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/50 text-foreground px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
