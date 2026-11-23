"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PaperClipIcon,
  SendIcon,
  XIcon,
  SparkIcon,
  TrashBinIcon,
  DocIcon,
} from "@/icons";
import { rpcCall } from "@/lib/api";

export interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

export interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  onSent?: () => void;
  maxSingleFileSizeBytes?: number;
  maxAttachmentCount?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ComposeDialog({
  open,
  onOpenChange,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  onSent,
  maxSingleFileSizeBytes = 25 * 1024 * 1024,
  maxAttachmentCount = 10,
}: ComposeDialogProps) {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialBody);
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number; file: File }>>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initialTo) setTo(initialTo);
      if (initialSubject) setSubject(initialSubject);
      if (initialBody) setMessage(initialBody);
      // Fetch available templates
      rpcCall<any>("template", "list", {})
        .then((res) => {
          if (Array.isArray(res)) setTemplates(res);
          else if (res?.templates) setTemplates(res.templates);
        })
        .catch(() => {});
    }
  }, [open, initialTo, initialSubject, initialBody]);

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
        setErrorMsg(`File "${f.name}" (${formatBytes(f.size)}) exceeds policy limit of ${formatBytes(maxSingleFileSizeBytes)}.`);
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
    setShowTemplates(false);
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
      // If there are attachments, convert to base64
      const attachmentPayloads = await Promise.all(
        attachments.map(async (a) => {
          const buffer = await a.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return {
            filename: a.name,
            contentType: a.file.type || "application/octet-stream",
            contentBase64: base64,
          };
        }),
      );

      const toAddresses = to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const ccAddresses = cc
        ? cc.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      const bccAddresses = bcc
        ? bcc.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      await rpcCall("mail", "send", {
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        subject: subject.trim(),
        text: message,
        html: `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #111;">${message.replace(/\n/g, "<br/>")}</div>`,
        attachments: attachmentPayloads,
        priority: isHighPriority ? "high" : "normal",
      });

      onOpenChange(false);
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setMessage("");
      setAttachments([]);
      onSent?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch sovereign message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            New Sovereign Message
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setIsHighPriority(!isHighPriority)}
              className={isHighPriority ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400" : ""}
            >
              {isHighPriority ? "High Priority" : "Normal Priority"}
            </Button>
            {templates.length > 0 && (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="gap-1 text-brand-600 dark:text-brand-400"
                >
                  <SparkIcon className="size-3.5" />
                  Templates
                </Button>
                {showTemplates && (
                  <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg z-50 dark:border-gray-800 dark:bg-gray-900">
                    <p className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase">
                      Select Template
                    </p>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleApplyTemplate(tpl)}
                          className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 truncate"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{tpl.name}</div>
                          {tpl.subject && <div className="text-[10px] text-gray-400 truncate">{tpl.subject}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3.5 pt-3 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                To
              </label>
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-[11px] text-brand-500 hover:text-brand-600 font-medium"
              >
                {showCcBcc ? "Hide CC/BCC" : "Cc / Bcc"}
              </button>
            </div>
            <Input
              type="text"
              placeholder="recipient@example.com (comma separated)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          {showCcBcc && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Cc
                </label>
                <Input
                  type="text"
                  placeholder="cc@example.com"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Bcc
                </label>
                <Input
                  type="text"
                  placeholder="bcc@example.com"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Subject
            </label>
            <Input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="flex-1 flex flex-col min-h-[160px]">
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <Textarea
              placeholder="Write your email content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 min-h-[160px] resize-none"
              required
            />
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Attachments ({attachments.length}/{maxAttachmentCount})
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs dark:border-gray-800 dark:bg-white/5"
                  >
                    <DocIcon className="size-3.5 text-gray-500" />
                    <span className="max-w-[140px] truncate font-medium text-gray-700 dark:text-gray-300">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({formatBytes(att.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperClipIcon className="size-4" />
              Attach Files
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Discard
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 cursor-pointer"
                disabled={isSending}
              >
                <SendIcon className="size-4 rtl:-scale-x-100" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
