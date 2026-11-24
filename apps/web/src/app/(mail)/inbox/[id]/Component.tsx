"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileIcon,
  MailIcon,
  RefreshIcon,
  SendIcon,
  TrashBinIcon,
  PaperClipIcon,
} from "@/icons";
import { Reply } from "lucide-react";
import { rpcCall } from "@/lib/api";
import SafeEmailViewer from "@/components/support/email/safe-email-viewer";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface EmailMessageData {
  id: string;
  _id?: string;
  sender: string;
  email: string;
  subject: string;
  date: string;
  time?: string;
  text?: string;
  html?: string;
  isRead?: boolean;
  isStarred?: boolean;
  priority?: "high" | "normal" | "low";
  spfStatus?: string;
  dkimStatus?: string;
  dmarcStatus?: string;
  attachments?: Array<{
    filename: string;
    size: number;
    contentType?: string;
    downloadUrl?: string;
    content?: string;
  }>;
}

export default function EmailDetailComponent({
  email,
}: {
  email: EmailMessageData;
}) {
  const router = useRouter();
  const [format, setFormat] = useState<"html" | "text">("html");
  const [loadRemoteImages, setLoadRemoteImages] = useState(false);
  const [showRawEml, setShowRawEml] = useState(false);
  const [rawEmlContent, setRawEmlContent] = useState("");
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const initial = (email.sender || email.email || "U")
    .charAt(0)
    .toUpperCase();
  const hasVisibleHtml = Boolean(
    email.html && email.html.replace(/<[^>]+>/g, "").trim().length > 0
  );
  const hasHtml = Boolean(email.html);
  const hasRemoteImages = Boolean(
    email.html && /<img[^>]+src=["'](http|\/\/)/i.test(email.html)
  );

  const handleDownloadAttachment = (att: any) => {
    if (att.downloadUrl) {
      window.open(att.downloadUrl, "_blank");
      return;
    }
    if (att.content) {
      const byteChars = atob(att.content);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNums);
      const blob = new Blob([byteArray], {
        type: att.contentType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.filename || "attachment";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFetchRawEml = async () => {
    setShowRawEml(true);
    setLoadingRaw(true);
    try {
      const res = await rpcCall<{ rawEml?: string; eml?: string }>(
        "mail",
        "getRaw",
        { messageId: email.id || email._id }
      );
      setRawEmlContent(res?.rawEml || res?.eml || "No raw RFC822 source available.");
    } catch {
      setRawEmlContent(
        `From: ${email.sender} <${email.email}>\nSubject: ${email.subject}\nDate: ${email.date}\nContent-Type: text/html\n\n${email.html || email.text || ""}`
      );
    } finally {
      setLoadingRaw(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await rpcCall("mail", "delete", {
        messageIds: [email.id || email._id],
      });
      router.push("/inbox");
    } catch (err: any) {
      alert("Error deleting message: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle={email.subject || "(no subject)"} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-xs"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshIcon className="size-4" />
            Refresh
          </Button>
          <Link href={`/inbox/new?replyTo=${email.id || email._id}`}>
            <Button size="sm" className="gap-2 text-xs">
              <Reply className="size-4" />
              Reply
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-2 text-xs"
          >
            <TrashBinIcon className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <ComponentCard title={email.subject || "(no subject)"}>
        {/* Security Verification & Sender Info */}
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex items-center gap-3.5">
            <Avatar size="lg">
              <AvatarFallback className="bg-brand-500 font-bold text-white text-base">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {email.sender}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  &lt;{email.email}&gt;
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge
                  size="sm"
                  variant="light"
                  color={email.spfStatus === "pass" ? "success" : "gray"}
                >
                  SPF: {(email.spfStatus || "PASS").toUpperCase()}
                </Badge>
                <Badge
                  size="sm"
                  variant="light"
                  color={email.dkimStatus === "pass" ? "success" : "gray"}
                >
                  DKIM: {(email.dkimStatus || "PASS").toUpperCase()}
                </Badge>
                <Badge
                  size="sm"
                  variant="light"
                  color={email.dmarcStatus === "pass" ? "success" : "gray"}
                >
                  DMARC: {(email.dmarcStatus || "PASS").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasHtml && (
              <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setFormat("html")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    format === "html"
                      ? "bg-brand-500 text-white font-medium shadow-xs"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("text")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    format === "text"
                      ? "bg-brand-500 text-white font-medium shadow-xs"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Text
                </button>
              </div>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={handleFetchRawEml}
              className="text-xs"
            >
              Raw Headers
            </Button>
            <span className="text-xs text-gray-400">
              {email.date} {email.time && `(${email.time})`}
            </span>
          </div>
        </div>

        {/* Safe Sandboxed Message Body */}
        <SafeEmailViewer
          html={email.html}
          text={email.text}
          format={format}
          allowRemoteImages={loadRemoteImages}
          onLoadRemoteImages={() => setLoadRemoteImages(true)}
        />

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Attachments ({email.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {email.attachments.map((att, index) => (
                <div
                  key={index}
                  onClick={() => handleDownloadAttachment(att)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/2 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileIcon className="size-5 text-brand-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                        {att.filename}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatBytes(att.size)}
                      </p>
                    </div>
                  </div>
                  <DownloadIcon className="size-4 text-gray-400 hover:text-brand-500 shrink-0 ms-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply / Forward footer buttons */}
        <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
          <Link href={`/inbox/new?replyTo=${email.id || email._id}`}>
            <Button size="sm" className="gap-2">
              <Reply className="size-4" />
              Reply
            </Button>
          </Link>
          <Link href={`/inbox/new?forwardFrom=${email.id || email._id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <SendIcon className="size-4" />
              Forward
            </Button>
          </Link>
        </div>
      </ComponentCard>

      {/* Raw RFC 822 EML Source Modal */}
      <Dialog open={showRawEml} onOpenChange={setShowRawEml}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <DialogTitle>Raw Email Source (RFC 822 / MIME)</DialogTitle>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(rawEmlContent);
                setCopiedRaw(true);
                setTimeout(() => setCopiedRaw(false), 2000);
              }}
            >
              {copiedRaw ? "Copied" : "Copy Source"}
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 rounded-xl border border-gray-200 bg-gray-900 p-4 font-mono text-xs text-gray-100 dark:border-gray-800">
            {loadingRaw ? (
              <div className="text-gray-400 py-6 text-center">Loading raw source...</div>
            ) : (
              <pre className="whitespace-pre-wrap">{rawEmlContent}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
