"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Component, { EmailMessageData } from "./Component";
import { rpcCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/icons";

export default function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [email, setEmail] = useState<EmailMessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    rpcCall<any>("mail", "get", { messageId: id })
      .then((res) => {
        if (!isMounted) return;
        const m = res?.data || res?.message || res;
        if (m && (m.id || m._id || m.subject)) {
          setEmail({
            id: m.id || m._id || id,
            _id: m._id || m.id || id,
            sender: m.from?.name || m.from?.address?.split("@")[0] || m.sender || "Unknown",
            email: m.from?.address || m.senderEmail || m.email || "unknown@domain.com",
            subject: m.subject || "(no subject)",
            date: m.date ? new Date(m.date).toLocaleDateString() : "Today",
            time: m.date ? new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            text: m.body?.text || m.text || "",
            html: m.body?.html || m.html || "",
            isRead: m.isRead,
            isStarred: m.isStarred,
            priority: m.priority || "normal",
            spfStatus: m.spfResult || m.spfStatus || "pass",
            dkimStatus: m.dkimResult || m.dkimStatus || "pass",
            dmarcStatus: m.dmarcResult || m.dmarcStatus || "pass",
            attachments: (m.attachments || []).map((att: any) => ({
              filename: att.filename || "file",
              size: att.size || att.sizeBytes || 0,
              contentType: att.contentType || "application/octet-stream",
              downloadUrl: att.downloadUrl,
              content: att.content,
            })),
          });
        } else {
          setError("Email message not found.");
        }
      })
      .catch((err) => {
        console.error("Failed to load email message:", err);
        if (isMounted) {
          setError(err.message || "Failed to load email message.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email Not Found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error || "The requested email message could not be loaded."}
        </p>
        <div className="mt-4">
          <Link href="/inbox">
            <Button size="sm" variant="outline" className="gap-2">
              <ArrowLeftIcon className="size-4" />
              Back to Inbox
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <Component key={email.id} email={email} />;
}
