"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  PaperClipIcon,
  SendIcon,
  TrashBinIcon,
  SparkIcon,
} from "@/icons";
import { rpcCall } from "@/lib/api";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

function ComposeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTo = searchParams.get("to") || "";
  const initialSubject = searchParams.get("subject") || "";
  const replyTo = searchParams.get("replyTo") || "";

  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState("");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ name: string; size: number; file: File }>
  >([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSingleFileSizeBytes = 25 * 1024 * 1024;
  const maxAttachmentCount = 10;

  useEffect(() => {
    // If replyTo is present, fetch original email to quote
    if (replyTo) {
      rpcCall<any>("mail", "get", { messageId: replyTo })
        .then((res) => {
          const m = res?.message || res;
          if (m) {
            if (!to && m.from?.address) setTo(m.from.address);
            if (!subject) {
              setSubject(
                m.subject?.startsWith("Re:") ? m.subject : `Re: ${m.subject || ""}`
              );
            }
            setMessage(
              `\n\n--- Original Message from ${m.from?.address || m.sender || ""} on ${m.date || ""} ---\n${m.text || m.snippet || ""}`
            );
          }
        })
        .catch(() => {});
    }

    // Load available templates
    rpcCall<any>("template", "list", {})
      .then((res) => {
        if (Array.isArray(res)) setTemplates(res);
        else if (res?.templates) setTemplates(res.templates);
      })
      .catch(() => {});
  }, [replyTo, to, subject]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (attachments.length + newFiles.length > maxAttachmentCount) {
      setErrorMsg(`Cannot attach more than ${maxAttachmentCount} files per message.`);
      return;
    }

    for (const f of newFiles) {
      if (f.size > maxSingleFileSizeBytes) {
        setErrorMsg(
          `File "${f.name}" (${formatBytes(f.size)}) exceeds policy limit of ${formatBytes(maxSingleFileSizeBytes)}.`
        );
        return;
      }
    }

    setAttachments((prev) => [
      ...prev,
      ...newFiles.map((f) => ({ name: f.name, size: f.size, file: f })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (tpl: TemplateItem) => {
    if (tpl.subject && !subject) setSubject(tpl.subject);
    setMessage(tpl.bodyText || tpl.bodyHtml || "");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!to.trim()) {
      setErrorMsg("Please enter at least one recipient email address.");
      return;
    }

    setIsSending(true);
    try {
      const attachmentPayloads = await Promise.all(
        attachments.map(async (a) => {
          const buffer = await a.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return {
            filename: a.name,
            contentType: a.file.type || "application/octet-stream",
            content: base64,
            size: a.size,
          };
        })
      );

      const toList = to.split(",").map((s) => s.trim()).filter(Boolean);
      const ccList = cc ? cc.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const bccList = bcc ? bcc.split(",").map((s) => s.trim()).filter(Boolean) : [];

      await rpcCall("mail", "send", {
        to: toList,
        cc: ccList,
        bcc: bccList,
        subject: subject || "(no subject)",
        text: message,
        html: message ? `<p>${message.replace(/\n/g, "<br/>")}</p>` : undefined,
        attachments: attachmentPayloads.length > 0 ? attachmentPayloads : undefined,
        headers: isHighPriority ? { "X-Priority": "1", Priority: "urgent" } : undefined,
      });

      router.push("/inbox");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to dispatch email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="New Message" />
        <Link href="/inbox">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Inbox
          </Button>
        </Link>
      </div>

      <ComponentCard
        title="Compose Outbound Email"
        desc="Dispatch an end-to-end DKIM-signed RFC email directly through your outbound MTA."
      >
        <form onSubmit={handleSend} className="space-y-5">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Recipients Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-16 shrink-0 text-xs font-semibold text-gray-500">
                To:
              </Label>
              <Input
                type="text"
                placeholder="recipient@example.com (comma separated)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="h-10 text-sm flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs text-gray-500"
              >
                {showCcBcc ? "Hide CC/BCC" : "CC / BCC"}
              </Button>
            </div>

            {showCcBcc && (
              <>
                <div className="flex items-center gap-3">
                  <Label className="w-16 shrink-0 text-xs font-semibold text-gray-500">
                    CC:
                  </Label>
                  <Input
                    type="text"
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="h-10 text-sm flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-16 shrink-0 text-xs font-semibold text-gray-500">
                    BCC:
                  </Label>
                  <Input
                    type="text"
                    placeholder="bcc@example.com"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="h-10 text-sm flex-1"
                  />
                </div>
              </>
            )}
          </div>

          {/* Subject & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Label className="w-16 shrink-0 text-xs font-semibold text-gray-500 self-start sm:self-center">
              Subject:
            </Label>
            <Input
              type="text"
              placeholder="Subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 text-sm flex-1"
            />
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                size="xs"
                variant={isHighPriority ? "destructive" : "outline"}
                onClick={() => setIsHighPriority(!isHighPriority)}
                className="text-xs"
              >
                {isHighPriority ? "Urgent Priority" : "Normal Priority"}
              </Button>

              {templates.length > 0 && (
                <div className="relative">
                  <select
                    className="h-8 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    onChange={(e) => {
                      const t = templates.find((item) => item.id === e.target.value);
                      if (t) handleApplyTemplate(t);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Insert Template...
                    </option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Dropzone / List */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-medium text-gray-500">
                Attachments ({attachments.length}/{maxAttachmentCount})
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs"
              >
                <PaperClipIcon className="size-3.5" />
                Attach Files
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-gray-200 p-3 dark:border-gray-800">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <PaperClipIcon className="size-3.5 text-gray-500" />
                    <span className="max-w-[200px] truncate">{att.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ({formatBytes(att.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashBinIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Body */}
          <div className="space-y-1.5">
            <Textarea
              placeholder="Write your email here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={14}
              className="font-sans text-sm leading-relaxed p-4"
              required
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/inbox">
              <Button type="button" variant="outline" size="sm">
                Discard
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={isSending}
              className="gap-2 px-6"
            >
              <SendIcon className="size-4" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <ComposeContent />
    </Suspense>
  );
}
