"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { useMailSocket, type MailEventPayload, type MailStateChangedPayload } from "@/lib/useMailSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  // Compose Modal state
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [contactSuggestions, setContactSuggestions] = useState<Array<{ id: string; name: string; email: string; company?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleSelectFolder = (newFolder: string) => {
    setFolder(newFolder);
    setSelectedMessageId(null);
    setActiveMessage(null);
    loadMessages(newFolder, searchQuery);
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    loadMessageDetail(messageId);
  };

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
      loadStats();
      showToast("Moved to Trash");
    } catch (err) {
      console.error("Failed to move to trash:", err);
    }
  };

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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) return;

    setSendingMail(true);
    try {
      const recipients = composeTo
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await rpcCall<{ messageId: string; deliveredInternally: number; queuedOutbound: number }>(
        "mail",
        "send",
        {
          to: recipients,
          subject: composeSubject,
          text: composeBody,
          html: `<p>${composeBody.replace(/\n/g, "<br/>")}</p>`,
        },
      );

      setShowCompose(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      loadStats();

      showToast(
        `Sent! (${res.deliveredInternally} internal, ${res.queuedOutbound} queued outbound)`,
      );

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Authenticating Secure Session...
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

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search emails by subject or sender..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              loadMessages(folder, e.target.value);
            }}
            className="pl-9 h-9 text-xs bg-muted/30 focus-visible:bg-background"
          />
        </div>

        {/* User Badges & Action Toolbar */}
        <div className="flex items-center gap-3">
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

          <div className="hidden md:flex flex-col items-end text-right">
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
          {/* List Toolbar */}
          <div className="p-2.5 px-3 border-b border-border flex items-center justify-between bg-card/60">
            <div className="flex items-center gap-2">
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
                  const initials = (msg.from?.name || msg.from?.address || "U")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.messageId)}
                      className={`p-3 cursor-pointer flex gap-3 items-start transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : !msg.isRead
                          ? "bg-primary/5 hover:bg-muted/50"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Unread indicator */}
                      <div className="pt-1 shrink-0">
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
              Loading email message...
            </div>
          ) : !activeMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-3 p-8 text-center">
              <Mail className="size-12 text-muted-foreground/40" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Select an email to read</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Choose a conversation from the mailbox list to inspect its contents, headers, and attachments.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message Header & Action Toolbar */}
              <div className="p-4 border-b border-border bg-card/30 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    {activeMessage.subject}
                  </h2>

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

      {/* ── COMPOSE MODAL (SHADCN CARD) ── */}
      {showCompose && (
        <Card className="fixed bottom-4 right-4 w-full max-w-lg border-border shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <CardHeader className="p-3 px-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Edit3 className="size-3.5 text-primary" />
              New Message
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowCompose(false)}
            >
              <X className="size-4 text-muted-foreground" />
            </Button>
          </CardHeader>

          <form onSubmit={handleSendEmail} className="flex flex-col">
            <div className="p-3 border-b border-border/60 relative">
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
            <div className="p-3">
              <Textarea
                placeholder="Write your email here..."
                rows={9}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                required
                className="border-none shadow-none focus-visible:ring-0 p-0 text-xs resize-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
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
          </form>
        </Card>
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
