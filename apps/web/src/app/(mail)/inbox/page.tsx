"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall, API_BASE_URL } from "@/lib/api";
import { useMailSocket, type MailEventPayload, type MailStateChangedPayload } from "@/lib/useMailSocket";
import {
  getStoredAccounts,
  getActiveAccount,
  saveAccount,
  switchAccount as switchStoreAccount,
  removeAccount,
  getAvatarColorForEmail,
  type StoredAccount,
} from "@/lib/account-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  ReplyAll,
  Forward,
  Archive,
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
  ChevronsUpDown,
  Moon,
  Sun,
  Flame,
  ArrowRight,
  ArrowLeft,
  Menu,
  MoreVertical,
  Printer,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File as FileIcon,
  Download,
  Plus,
  Tag,
  ShieldAlert,
  Infinity as InfinityIcon,
  HelpCircle,
} from "lucide-react";

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
  labels?: string[];
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
  labels?: string[];
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

interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
}

function formatBytes(bytes: number): string {
  if (bytes === -1) return "Unlimited";
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getAttachmentIcon(type: string, name: string) {
  const mime = (type || "").toLowerCase();
  const ext = (name || "").split(".").pop()?.toLowerCase() || "";

  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return { icon: FileImage, color: "text-purple-500", bg: "bg-purple-500/10" };
  }
  if (mime.includes("pdf") || ext === "pdf") {
    return { icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
  }
  if (mime.includes("spreadsheet") || mime.includes("excel") || ["xls", "xlsx", "csv"].includes(ext)) {
    return { icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-500/10" };
  }
  if (mime.includes("zip") || mime.includes("compressed") || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { icon: FileArchive, color: "text-amber-500", bg: "bg-amber-500/10" };
  }
  return { icon: FileIcon, color: "text-sky-500", bg: "bg-sky-500/10" };
}

const COLOR_TAGS = [
  { id: "vip", name: "VIP", color: "text-purple-400 bg-purple-500/15 border-purple-500/30", dot: "bg-purple-500" },
  { id: "urgent", name: "Urgent", color: "text-red-400 bg-red-500/15 border-red-500/30", dot: "bg-red-500" },
  { id: "work", name: "Work", color: "text-blue-400 bg-blue-500/15 border-blue-500/30", dot: "bg-blue-500" },
  { id: "invoices", name: "Invoices", color: "text-amber-400 bg-amber-500/15 border-amber-500/30", dot: "bg-amber-500" },
  { id: "personal", name: "Personal", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", dot: "bg-emerald-500" },
  { id: "projects", name: "Projects", color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30", dot: "bg-cyan-500" },
];

export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-Account state
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [activeAccount, setActiveAccountState] = useState<StoredAccount | null>(null);

  // Mobile layout state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyFormat, setBodyFormat] = useState<"html" | "text">("html");
  const [loadRemoteImages, setLoadRemoteImages] = useState(false);

  // Batch multi-selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Composer state
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [composeBcc, setComposeBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState<Array<{ name: string; size: number; file: File }>>([]);

  // Templates
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Modals & Raw EML Viewer
  const [showEmlViewer, setShowEmlViewer] = useState(false);
  const [rawEmlCopied, setRawEmlCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState<any | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Window resize listener for responsive state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync stored accounts list
  const refreshAccountsList = useCallback(() => {
    setAccounts(getStoredAccounts());
    setActiveAccountState(getActiveAccount());
  }, []);

  // Fetch authenticated user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await rpcCall<UserProfile>("auth", "me", {});
      setUser(res);

      // Register or update active account in account store
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
          avatarColor: getAvatarColorForEmail(res.email),
        });
        refreshAccountsList();
      }
      return res;
    } catch {
      router.push("/login");
      return null;
    }
  }, [router, refreshAccountsList]);

  // Fetch mailbox messages
  const fetchMessages = useCallback(
    async (targetFolder: string) => {
      try {
        const res = await rpcCall<{ items: MailItem[]; total: number }>("mail", "list", {
          folder: targetFolder,
          page: 1,
          limit: 100,
        });
        setMessages(res.items || []);
      } catch (err: any) {
        showToast(err.message || "Failed to load messages.");
      }
    },
    [],
  );

  // Fetch mailbox counters
  const fetchStats = useCallback(async () => {
    try {
      const res = await rpcCall<MailboxStats>("mail", "stats", {});
      setStats(res);
    } catch {}
  }, []);

  // Fetch templates for insert
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await rpcCall<{ items: TemplateItem[] }>("template", "list", {});
      setTemplates(res.items || []);
    } catch {}
  }, []);

  // Load message detail
  const loadMessageDetail = useCallback(
    async (item: MailItem) => {
      setSelectedMessageId(item.id);
      setLoadingMessage(true);
      setLoadRemoteImages(false);
      try {
        const detail = await rpcCall<MessageDetail>("mail", "get", { id: item.id });
        setActiveMessage(detail);

        // Auto mark read if unread
        if (!item.isRead) {
          await rpcCall("mail", "update-state", { id: item.id, isRead: true });
          setMessages((prev) => prev.map((m) => (m.id === item.id ? { ...m, isRead: true } : m)));
          fetchStats();
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load message.");
      } finally {
        setLoadingMessage(false);
      }
    },
    [fetchStats],
  );

  // Real-time WebSocket connection
  const handleMailReceived = useCallback(
    (payload: MailEventPayload) => {
      showToast(`New email: ${payload.subject} (from ${payload.from})`);
      fetchMessages(folder);
      fetchStats();
    },
    [folder, fetchMessages, fetchStats],
  );

  const handleMailStateChanged = useCallback((payload: MailStateChangedPayload) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.messageId === payload.messageId || m.id === payload.messageId) {
          return {
            ...m,
            isRead: payload.isRead !== undefined ? payload.isRead : m.isRead,
            isStarred: payload.isStarred !== undefined ? payload.isStarred : m.isStarred,
            folder: payload.folder !== undefined ? payload.folder : m.folder,
          };
        }
        return m;
      }),
    );
  }, []);

  useMailSocket({
    onMailReceived: handleMailReceived,
    onStateChanged: handleMailStateChanged,
  });

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      const profile = await fetchUserProfile();
      if (profile) {
        await Promise.all([fetchMessages("INBOX"), fetchStats(), fetchTemplates()]);
      }
      setLoading(false);
    }
    init();
  }, [fetchUserProfile, fetchMessages, fetchStats, fetchTemplates]);

  // Handle folder switch
  const handleSelectFolder = (newFolder: string) => {
    setFolder(newFolder);
    setSelectedMessageId(null);
    setActiveMessage(null);
    setSelectedIds(new Set());
    setMobileSidebarOpen(false);
    fetchMessages(newFolder);
  };

  // Switch account from popover
  const handleSwitchAccount = (targetUserId: string) => {
    const switched = switchStoreAccount(targetUserId);
    if (switched) {
      showToast(`Switched account to ${switched.email}`);
      window.location.reload();
    }
  };

  // Log out
  const handleLogout = () => {
    if (user?.userId) {
      removeAccount(user.userId);
    }
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  // Actions: Star / Unstar
  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      await rpcCall("mail", "update-state", { id, isStarred: !currentStarred });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: !currentStarred } : m)));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, isStarred: !currentStarred });
      }
      fetchStats();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle star.");
    }
  };

  // Actions: Mark Read / Unread
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await rpcCall("mail", "update-state", { id, isRead: !currentRead });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m)));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, isRead: !currentRead });
      }
      fetchStats();
    } catch (err: any) {
      showToast(err.message || "Failed to update read state.");
    }
  };

  // Actions: Archive
  const handleArchive = async (id: string) => {
    try {
      await rpcCall("mail", "update-state", { id, folder: "ARCHIVE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setActiveMessage(null);
      setSelectedMessageId(null);
      showToast("Message moved to Archive.");
      fetchStats();
    } catch (err: any) {
      showToast(err.message || "Failed to archive message.");
    }
  };

  // Actions: Delete / Trash
  const handleDelete = async (id: string) => {
    try {
      await rpcCall("mail", "update-state", { id, folder: "TRASH" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setActiveMessage(null);
      setSelectedMessageId(null);
      showToast("Message moved to Trash.");
      fetchStats();
    } catch (err: any) {
      showToast(err.message || "Failed to delete message.");
    }
  };

  // Reply handlers
  const handleReply = () => {
    if (!activeMessage) return;
    setComposeTo(activeMessage.from.address);
    setComposeSubject(activeMessage.subject.startsWith("Re:") ? activeMessage.subject : `Re: ${activeMessage.subject}`);
    setComposeBody(`\n\n--- On ${new Date(activeMessage.date).toLocaleString()}, ${activeMessage.from.name || activeMessage.from.address} wrote:\n> ${activeMessage.body.text || activeMessage.body.snippet}`);
    setShowCompose(true);
  };

  const handleReplyAll = () => {
    if (!activeMessage) return;
    setComposeTo(activeMessage.from.address);
    const otherRecipients = [
      ...activeMessage.to.filter((t) => t.address !== user?.email && t.address !== activeMessage.from.address),
      ...(activeMessage.cc || []),
    ].map((r) => r.address);

    if (otherRecipients.length > 0) {
      setComposeCc(otherRecipients.join(", "));
      setShowCcBcc(true);
    }
    setComposeSubject(activeMessage.subject.startsWith("Re:") ? activeMessage.subject : `Re: ${activeMessage.subject}`);
    setComposeBody(`\n\n--- On ${new Date(activeMessage.date).toLocaleString()}, ${activeMessage.from.name || activeMessage.from.address} wrote:\n> ${activeMessage.body.text || activeMessage.body.snippet}`);
    setShowCompose(true);
  };

  const handleForward = () => {
    if (!activeMessage) return;
    setComposeTo("");
    setComposeSubject(activeMessage.subject.startsWith("Fwd:") ? activeMessage.subject : `Fwd: ${activeMessage.subject}`);
    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${activeMessage.from.name || ""} <${activeMessage.from.address}>\nDate: ${new Date(activeMessage.date).toLocaleString()}\nSubject: ${activeMessage.subject}\nTo: ${activeMessage.to.map((t) => t.address).join(", ")}\n\n${activeMessage.body.text || activeMessage.body.snippet}`);
    setShowCompose(true);
  };

  // Toggle Color Tag on active email
  const handleToggleTag = async (id: string, tagId: string) => {
    if (!activeMessage) return;
    const currentLabels = activeMessage.labels || [];
    const nextLabels = currentLabels.includes(tagId)
      ? currentLabels.filter((l) => l !== tagId)
      : [...currentLabels, tagId];

    try {
      await rpcCall("mail", "update-state", { id, labels: nextLabels });
      setActiveMessage({ ...activeMessage, labels: nextLabels });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, labels: nextLabels } : m)),
      );
      showToast("Tag updated.");
    } catch (err: any) {
      showToast(err.message || "Failed to update tag.");
    }
  };

  // Attachment upload validation with Organization Limits
  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxFileSize = user?.maxSingleFileSizeBytes ?? 26214400; // default 25MB
    const maxCount = user?.maxAttachmentCount ?? 10;

    // Check count limit
    if (maxCount !== -1 && composeAttachments.length + files.length > maxCount) {
      showToast(`Attachment limit reached: Maximum ${maxCount} files allowed per email.`);
      return;
    }

    // Check individual file size limit
    for (const f of files) {
      if (maxFileSize !== -1 && f.size > maxFileSize) {
        showToast(`File "${f.name}" (${formatBytes(f.size)}) exceeds your organization's max single file limit of ${formatBytes(maxFileSize)}.`);
        return;
      }
    }

    const newEntries = files.map((f) => ({ name: f.name, size: f.size, file: f }));
    setComposeAttachments((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Insert template into composer
  const handleInsertTemplate = (tmpl: TemplateItem) => {
    setComposeSubject(tmpl.subject);
    setComposeBody(tmpl.bodyText || tmpl.bodyHtml || "");
    setShowTemplatePicker(false);
    showToast(`Template "${tmpl.name}" applied.`);
  };

  // Send Email
  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composeTo.trim()) {
      showToast("Please provide at least one recipient.");
      return;
    }

    setIsSending(true);
    try {
      const toAddresses = composeTo.split(",").map((s) => s.trim()).filter(Boolean);
      const ccAddresses = composeCc ? composeCc.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const bccAddresses = composeBcc ? composeBcc.split(",").map((s) => s.trim()).filter(Boolean) : [];

      await rpcCall("mail", "send", {
        to: toAddresses,
        cc: ccAddresses.length > 0 ? ccAddresses : undefined,
        bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
        subject: composeSubject.trim() || "(No Subject)",
        text: composeBody,
        html: composeBody.includes("<") ? composeBody : undefined,
      });

      showToast("Email dispatched successfully!");
      setShowCompose(false);
      setComposeTo("");
      setComposeCc("");
      setComposeBcc("");
      setComposeSubject("");
      setComposeBody("");
      setComposeAttachments([]);
      fetchMessages(folder);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || "Failed to dispatch email.");
    } finally {
      setIsSending(false);
    }
  };

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterUnreadOnly && m.isRead) return false;
      if (activeTagFilter && (!m.labels || !m.labels.includes(activeTagFilter))) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.from.address.toLowerCase().includes(q) ||
        (m.from.name && m.from.name.toLowerCase().includes(q)) ||
        m.snippet.toLowerCase().includes(q)
      );
    });
  }, [messages, filterUnreadOnly, activeTagFilter, searchQuery]);

  // Check if sender is external
  const isExternalSender = useMemo(() => {
    if (!activeMessage || !user) return false;
    const senderDomain = activeMessage.from.address.split("@")[1]?.toLowerCase();
    const userDomain = user.email.split("@")[1]?.toLowerCase();
    return senderDomain && userDomain && senderDomain !== userDomain;
  }, [activeMessage, user]);

  // Generate Raw RFC 822 EML
  const rawEmlContent = useMemo(() => {
    if (!activeMessage) return "";
    const fromStr = activeMessage.from.name
      ? `"${activeMessage.from.name}" <${activeMessage.from.address}>`
      : `<${activeMessage.from.address}>`;
    const toStr = activeMessage.to
      .map((t) => (t.name ? `"${t.name}" <${t.address}>` : `<${t.address}>`))
      .join(", ");
    return [
      `From: ${fromStr}`,
      `To: ${toStr}`,
      `Subject: ${activeMessage.subject}`,
      `Date: ${new Date(activeMessage.date).toUTCString()}`,
      `Message-ID: ${activeMessage.messageId}`,
      `Authentication-Results: spf=${activeMessage.spfResult || "pass"} dkim=${activeMessage.dkimResult || "pass"} dmarc=${activeMessage.dmarcResult || "pass"}`,
      `Content-Type: ${activeMessage.body.html ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"'}`,
      "",
      activeMessage.body.html || activeMessage.body.text || "(Empty body)",
    ].join("\r\n");
  }, [activeMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Loading sovereign mailbox...</span>
      </div>
    );
  }

  // Quota percentages
  const quotaBytes = user?.storageQuotaBytes ?? 10737418240;
  const usedBytes = user?.storageUsedBytes ?? 0;
  const quotaPercent = quotaBytes === -1 ? 0 : Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-2xl animate-in fade-in duration-200">
          {toast}
        </div>
      )}

      {/* ── MOBILE HEADER (Visible only on < 768px) ── */}
      <header className="h-14 border-b border-border bg-card/70 backdrop-blur-md px-3 flex items-center justify-between shrink-0 md:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="size-9"
          >
            <Menu className="size-5" />
          </Button>
          <span className="font-bold text-sm capitalize">{folder.toLowerCase()}</span>
          {stats.inboxUnread > 0 && folder === "INBOX" && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
              {stats.inboxUnread}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchMessages(folder)}
            className="size-9"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCompose(true)}
            className="h-8 gap-1 px-3 text-xs font-semibold"
          >
            <Edit3 className="size-3.5" />
            Compose
          </Button>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR PANE (Desktop permanent, Mobile drawer) ── */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-0
            w-64 border-r border-border bg-card/40 backdrop-blur-md md:bg-card/20
            flex flex-col justify-between p-3 shrink-0 transition-transform duration-200
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Top of Sidebar: Brand & Compose */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                  C
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">{user?.orgName || "CellsInbox"}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">Sovereign Mail</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <Button
              onClick={() => {
                setShowCompose(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full justify-start gap-2 shadow-sm font-semibold h-9 text-xs"
            >
              <Edit3 className="size-4" />
              Compose Email
            </Button>

            {/* Folders List */}
            <nav className="space-y-0.5 pt-2">
              {[
                { id: "INBOX", label: "Inbox", icon: Inbox, count: stats.inboxUnread },
                { id: "STARRED", label: "Starred", icon: Star, count: stats.starred },
                { id: "SENT", label: "Sent", icon: Send, count: stats.sent },
                { id: "DRAFTS", label: "Drafts", icon: FileText, count: stats.drafts },
                { id: "TRASH", label: "Trash", icon: Trash2, count: stats.trash },
              ].map((f) => {
                const Icon = f.icon;
                const active = folder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFolder(f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4" />
                      <span>{f.label}</span>
                    </div>
                    {f.count !== undefined && f.count > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Color Tags & Labels Section */}
            <div className="pt-3 border-t border-border/30 space-y-1">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Tag className="size-3 text-primary" /> Color Tags
                </span>
                {activeTagFilter && (
                  <button
                    onClick={() => setActiveTagFilter(null)}
                    className="text-primary hover:underline text-[9px] lowercase font-normal"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {COLOR_TAGS.map((tag) => {
                  const isSelected = activeTagFilter === tag.id;
                  const count = messages.filter((m) => m.labels?.includes(tag.id)).length;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setActiveTagFilter(isSelected ? null : tag.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? "bg-accent font-semibold text-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${tag.dot} shrink-0`} />
                        <span>{tag.name}</span>
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom of Sidebar: User Profile & Popover Menu */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            {/* Storage Quota Progress */}
            <div className="px-1 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <HardDrive className="size-3" /> Storage
                </span>
                <span className="font-mono">
                  {formatBytes(usedBytes)} / {formatBytes(quotaBytes)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>

            {/* User Account Popover Trigger */}
            <Popover>
              <PopoverTrigger className="w-full flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 hover:border-border transition-colors text-left group cursor-pointer">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className={`size-8 text-xs font-bold text-white shrink-0 ${getAvatarColorForEmail(user?.email || "")}`}>
                    <AvatarFallback className="bg-transparent text-white font-bold">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {user?.displayName || user?.email?.split("@")[0]}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              </PopoverTrigger>

              <PopoverContent side="top" align="start" className="w-80 p-3 space-y-3 shadow-2xl">
                {/* Active User Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
                  <Avatar className={`size-9 text-xs font-bold text-white shrink-0 ${getAvatarColorForEmail(user?.email || "")}`}>
                    <AvatarFallback className="bg-transparent text-white font-bold">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{user?.displayName || user?.email}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 mt-0.5">
                      {user?.role?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Multi-Account Switcher Section */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Switch Account
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {accounts.map((acc) => {
                      const isCurrent = acc.userId === user?.userId;
                      return (
                        <button
                          key={acc.userId}
                          onClick={() => handleSwitchAccount(acc.userId)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${
                            isCurrent ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className={`size-6 text-[10px] font-bold text-white shrink-0 ${acc.avatarColor || getAvatarColorForEmail(acc.email)}`}>
                              <AvatarFallback className="bg-transparent text-white">
                                {acc.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-xs font-mono">{acc.email}</span>
                          </div>
                          {isCurrent && <Check className="size-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <Link href="/login?addAccount=true">
                    <Button variant="outline" size="sm" className="w-full text-xs h-7 gap-1 mt-1">
                      <Plus className="size-3" />
                      Add another account
                    </Button>
                  </Link>
                </div>

                <Separator />

                {/* Nav Links */}
                <div className="space-y-0.5 text-xs">
                  <Link href="/settings">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
                      <Settings className="size-3.5 text-muted-foreground" />
                      <span>Security & Passkeys</span>
                    </div>
                  </Link>

                  {/* Tenant Admin Link */}
                  {(user?.role === "ORG_ADMIN" || user?.role === "PLATFORM_ADMIN") && (
                    <Link href={`/org/${user.orgSlug || "default"}/admin`}>
                      <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-primary font-medium">
                        <div className="flex items-center gap-2">
                          <Sliders className="size-3.5" />
                          <span>Tenant Admin Settings</span>
                        </div>
                        <ArrowRight className="size-3" />
                      </div>
                    </Link>
                  )}

                  {/* Platform Admin Link */}
                  {user?.role === "PLATFORM_ADMIN" && (
                    <Link href="/admin">
                      <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-emerald-500 font-medium">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-3.5" />
                          <span>Platform Governance</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">
                          MASTER
                        </Badge>
                      </div>
                    </Link>
                  )}
                </div>

                <Separator />

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium"
                >
                  <LogOut className="size-3.5" />
                  <span>Log out of {user?.email}</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </aside>

        {/* ── MESSAGE LIST PANE ── */}
        <section
          className={`
            border-r border-border bg-card/10 flex flex-col shrink-0
            ${selectedMessageId && isMobile ? "hidden" : "w-full md:w-80 lg:w-96 flex"}
          `}
        >
          {/* List Search & Controls */}
          <div className="p-3 border-b border-border/60 space-y-2 shrink-0">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-muted/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`text-[11px] font-medium transition-colors ${
                  filterUnreadOnly ? "text-primary font-bold" : "hover:text-foreground"
                }`}
              >
                {filterUnreadOnly ? "Showing Unread" : "Filter Unread"}
              </button>
              <span className="font-mono text-[11px]">{filteredMessages.length} messages</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filteredMessages.map((msg) => {
              const active = selectedMessageId === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => loadMessageDetail(msg)}
                  className={`p-3 cursor-pointer transition-colors text-left relative group ${
                    active ? "bg-accent/60" : !msg.isRead ? "bg-card/80 hover:bg-muted/40" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {!msg.isRead && <span className="size-2 rounded-full bg-primary shrink-0" />}
                      <span className={`text-xs truncate ${!msg.isRead ? "font-bold text-foreground" : "font-medium text-foreground/90"}`}>
                        {msg.from.name || msg.from.address}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-mono">
                      {new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className={`text-xs truncate mb-1 ${!msg.isRead ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                    {msg.subject || "(No Subject)"}
                  </div>

                  <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {msg.snippet || "(Empty snippet)"}
                  </div>

                  {/* Message Item Tags */}
                  {msg.labels && msg.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-0.5">
                      {msg.labels.map((lbl) => {
                        const tagInfo = COLOR_TAGS.find((t) => t.id === lbl);
                        if (!tagInfo) return null;
                        return (
                          <span
                            key={lbl}
                            className={`text-[9px] font-medium px-1.5 py-0.2 rounded-full border ${tagInfo.color}`}
                          >
                            {tagInfo.name}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Badges / Attachments */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <div className="flex items-center gap-1.5">
                      {msg.hasAttachments && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 gap-1 border-border/60">
                          <Paperclip className="size-2.5 text-primary" />
                          File
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(msg.id, msg.isStarred);
                      }}
                      className="text-muted-foreground hover:text-amber-500 transition-colors"
                    >
                      <Star className={`size-3.5 ${msg.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="text-center py-16 px-4 text-muted-foreground text-xs">
                <Mail className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-medium">No messages found in {folder}.</p>
                <p className="text-[11px] mt-0.5">Your sovereign inbox is completely up to date.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── EMAIL VIEWER PANE (Desktop right, Mobile full-screen when selected) ── */}
        <main
          className={`
            flex-1 flex flex-col bg-background overflow-hidden
            ${!selectedMessageId && isMobile ? "hidden" : "flex"}
          `}
        >
          {activeMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Bulwark-Grade Action Toolbar */}
              <div className="h-13 border-b border-border bg-card/40 backdrop-blur-md px-3 flex items-center justify-between shrink-0 gap-2">
                <div className="flex items-center gap-1">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessageId(null)}
                    className="md:hidden gap-1 text-xs h-8 px-2"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>

                  {/* Primary Bulwark Reply Actions */}
                  <Button variant="ghost" size="sm" onClick={handleReply} className="gap-1.5 text-xs h-8">
                    <Reply className="size-3.5" />
                    <span className="hidden sm:inline">Reply</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReplyAll} className="gap-1.5 text-xs h-8">
                    <ReplyAll className="size-3.5" />
                    <span className="hidden sm:inline">Reply All</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleForward} className="gap-1.5 text-xs h-8">
                    <Forward className="size-3.5" />
                    <span className="hidden sm:inline">Forward</span>
                  </Button>

                  <Separator orientation="vertical" className="h-4 mx-1" />

                  {/* Bulwark Message Triage Controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArchive(activeMessage.id)}
                    className="size-8"
                    title="Archive"
                  >
                    <Archive className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(activeMessage.id)}
                    className="size-8 hover:text-destructive"
                    title="Move to Trash"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleRead(activeMessage.id, activeMessage.isRead)}
                    className="size-8"
                    title={activeMessage.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <Mail className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStar(activeMessage.id, activeMessage.isStarred)}
                    className="size-8"
                    title="Star / Flag"
                  >
                    <Star className={`size-3.5 ${activeMessage.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                  </Button>

                  {/* Color Tag Picker */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Color Tags">
                      <Tag className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44 text-xs">
                      {COLOR_TAGS.map((tag) => {
                        const isTagged = activeMessage.labels?.includes(tag.id);
                        return (
                          <DropdownMenuItem
                            key={tag.id}
                            onClick={() => handleToggleTag(activeMessage.id, tag.id)}
                            className="flex items-center justify-between text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`size-2.5 rounded-full ${tag.dot}`} />
                              <span>{tag.name}</span>
                            </div>
                            {isTagged && <Check className="size-3 text-primary" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bulwark Overflow More Menu */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      <DropdownMenuItem onClick={() => setShowEmlViewer(true)} className="gap-2 text-xs">
                        <FileCode className="size-3.5" />
                        View Raw RFC 822 EML
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()} className="gap-2 text-xs">
                        <Printer className="size-3.5" />
                        Print Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(activeMessage.messageId);
                          showToast("Message-ID copied to clipboard.");
                        }}
                        className="gap-2 text-xs"
                      >
                        <Copy className="size-3.5" />
                        Copy Message-ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Message Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {/* Subject Header */}
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {activeMessage.subject || "(No Subject)"}
                  </h1>
                  {activeMessage.labels && activeMessage.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeMessage.labels.map((lbl) => {
                        const tagInfo = COLOR_TAGS.find((t) => t.id === lbl);
                        if (!tagInfo) return null;
                        return (
                          <span
                            key={lbl}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagInfo.color}`}
                          >
                            {tagInfo.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bulwark Security & Authentication Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-500 gap-1">
                    <ShieldCheck className="size-3" />
                    SPF: {activeMessage.spfResult || "PASS"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-500 gap-1">
                    <ShieldCheck className="size-3" />
                    DKIM: {activeMessage.dkimResult || "PASS"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-500 gap-1">
                    <ShieldCheck className="size-3" />
                    DMARC: {activeMessage.dmarcResult || "PASS"}
                  </Badge>
                  {isExternalSender && (
                    <Badge variant="secondary" className="text-[10px] gap-1 bg-amber-500/10 text-amber-500 border-amber-500/30">
                      <AlertTriangle className="size-3" />
                      External Sender
                    </Badge>
                  )}
                </div>

                {/* Sender & Recipient Metadata Card */}
                <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-card/60 border border-border/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className={`size-10 font-bold text-white shrink-0 ${getAvatarColorForEmail(activeMessage.from.address)}`}>
                      <AvatarFallback className="bg-transparent text-white font-bold">
                        {activeMessage.from.address[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-bold flex items-center gap-2 truncate">
                        <span>{activeMessage.from.name || activeMessage.from.address}</span>
                        {activeMessage.from.name && (
                          <span className="text-xs text-muted-foreground font-mono font-normal">
                            &lt;{activeMessage.from.address}&gt;
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        To: {activeMessage.to.map((t) => t.name || t.address).join(", ")}
                      </div>
                      {activeMessage.cc && activeMessage.cc.length > 0 && (
                        <div className="text-[11px] text-muted-foreground font-mono truncate">
                          Cc: {activeMessage.cc.map((t) => t.name || t.address).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-medium">
                      {new Date(activeMessage.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {new Date(activeMessage.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {/* Bulwark Remote Images Privacy Shield */}
                {activeMessage.body.html && !loadRemoteImages && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="size-3.5 text-primary" />
                      <span>Remote images were blocked to protect your sovereign privacy.</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLoadRemoteImages(true)}
                      className="text-xs h-7 px-2"
                    >
                      Load Images
                    </Button>
                  </div>
                )}

                {/* Bulwark Attachment Cards Grid */}
                {activeMessage.attachments && activeMessage.attachments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-primary" />
                        Attachments ({activeMessage.attachments.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {activeMessage.attachments.map((att) => {
                        const { icon: AttIcon, color, bg } = getAttachmentIcon(att.contentType, att.filename);
                        return (
                          <div
                            key={att.id}
                            className="p-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/50 transition-colors flex items-center justify-between gap-2 group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`size-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
                                <AttIcon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium truncate" title={att.filename}>
                                  {att.filename}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {formatBytes(att.sizeBytes)}
                                </div>
                              </div>
                            </div>
                            <a
                              href={att.downloadUrl || `${API_BASE_URL}/api/rpc/mail/attachment-content?id=${att.id}`}
                              target="_blank"
                              rel="noreferrer"
                              download={att.filename}
                            >
                              <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground hover:text-foreground">
                                <Download className="size-3.5" />
                              </Button>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Email Body Area */}
                <div className="min-h-[250px] leading-relaxed text-sm">
                  {activeMessage.body.html ? (
                    <div
                      className="prose dark:prose-invert max-w-none break-words text-sm overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: loadRemoteImages
                          ? activeMessage.body.html
                          : activeMessage.body.html.replace(/src=["']http/gi, 'data-blocked="true" src="about:blank'),
                      }}
                    />
                  ) : (
                    <pre className="font-sans whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {activeMessage.body.text || "(Empty body)"}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <Mail className="size-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-semibold text-foreground">Select a message</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Choose an email from the list to view its contents, inspect DKIM/SPF headers, and manage attachments.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── BULWARK-GRADE EMAIL COMPOSER MODAL ── */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <Card className="w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] border-border bg-card shadow-2xl flex flex-col rounded-t-2xl sm:rounded-2xl">
            {/* Composer Header */}
            <CardHeader className="h-12 border-b border-border px-4 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Edit3 className="size-4 text-primary" />
                New Message
              </CardTitle>
              <div className="flex items-center gap-1">
                {/* Template Picker */}
                <DropdownMenu open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
                  <DropdownMenuTrigger className="h-7 px-2 text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground rounded-md border border-input bg-transparent">
                    <Sparkles className="size-3 text-primary" />
                    Insert Template
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 text-xs">
                    {templates.map((tmpl) => (
                      <DropdownMenuItem key={tmpl.id} onClick={() => handleInsertTemplate(tmpl)} className="gap-2 text-xs">
                        <FileText className="size-3.5 text-primary" />
                        <span className="truncate">{tmpl.name}</span>
                      </DropdownMenuItem>
                    ))}
                    {templates.length === 0 && (
                      <div className="p-2 text-center text-muted-foreground text-[11px]">
                        No templates saved.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowCompose(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Composer Inputs */}
            <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border/40 space-y-2 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium w-8">To:</span>
                    <Input
                      required
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="recipient@example.com (comma separated)"
                      className="border-0 shadow-none text-xs h-7 px-1 focus-visible:ring-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                  >
                    {showCcBcc ? "Hide Cc/Bcc" : "Cc / Bcc"}
                  </button>
                </div>

                {showCcBcc && (
                  <div className="space-y-1.5 pt-1 border-t border-border/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium w-8">Cc:</span>
                      <Input
                        value={composeCc}
                        onChange={(e) => setComposeCc(e.target.value)}
                        placeholder="cc@example.com"
                        className="border-0 shadow-none text-xs h-7 px-1 focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium w-8">Bcc:</span>
                      <Input
                        value={composeBcc}
                        onChange={(e) => setComposeBcc(e.target.value)}
                        placeholder="bcc@example.com"
                        className="border-0 shadow-none text-xs h-7 px-1 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                  <span className="text-xs text-muted-foreground font-medium w-8">Subj:</span>
                  <Input
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Subject line"
                    className="border-0 shadow-none text-xs h-7 px-1 focus-visible:ring-0 font-medium"
                  />
                </div>
              </div>

              {/* Body Textarea */}
              <div className="flex-1 p-3 overflow-y-auto">
                <Textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your sovereign message..."
                  className="w-full h-full min-h-[160px] border-0 shadow-none resize-none text-xs leading-relaxed focus-visible:ring-0 p-0"
                />
              </div>

              {/* Uploaded Attachment Chips */}
              {composeAttachments.length > 0 && (
                <div className="px-3 py-2 border-t border-border/40 bg-muted/20 flex flex-wrap gap-2 shrink-0">
                  {composeAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card border border-border text-xs text-foreground font-mono"
                    >
                      <Paperclip className="size-3 text-primary shrink-0" />
                      <span className="truncate max-w-[140px]">{att.name}</span>
                      <span className="text-muted-foreground text-[10px]">({formatBytes(att.size)})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="hover:text-destructive transition-colors ml-1"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Composer Footer Actions */}
              <CardFooter className="h-13 border-t border-border px-3 flex items-center justify-between shrink-0 bg-muted/10">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileAttachment}
                      className="hidden"
                    />
                    <div className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Paperclip className="size-4" />
                    </div>
                  </label>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Max: {formatBytes(user?.maxSingleFileSizeBytes ?? 26214400)} / file
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompose(false)}
                    className="text-xs h-8"
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSending}
                    className="h-8 gap-1.5 text-xs font-semibold px-4"
                  >
                    <Send className="size-3.5" />
                    {isSending ? "Sending..." : "Send (⌘+Enter)"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ── RAW RFC 822 EML VIEWER MODAL ── */}
      {showEmlViewer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl h-[80vh] border-border bg-card shadow-2xl flex flex-col">
            <CardHeader className="h-12 border-b border-border px-4 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCode className="size-4 text-primary" />
                Raw RFC 822 EML Message Headers
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(rawEmlContent);
                    setRawEmlCopied(true);
                    setTimeout(() => setRawEmlCopied(false), 2000);
                  }}
                >
                  {rawEmlCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  {rawEmlCopied ? "Copied" : "Copy EML"}
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowEmlViewer(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed bg-black/20">
              <pre className="text-foreground/90 whitespace-pre-wrap">{rawEmlContent}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
