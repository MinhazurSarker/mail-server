"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Component, { EmailMessageData } from "./Component";
import { rpcCall } from "@/lib/api";

export default function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [email, setEmail] = useState<EmailMessageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    rpcCall<any>("mail", "get", { messageId: id })
      .then((res) => {
        if (!isMounted) return;
        const m = res?.message || res;
        if (m) {
          setEmail({
            id: m.id || m._id || id,
            _id: m._id || m.id || id,
            sender: m.from?.name || m.from?.address?.split("@")[0] || m.sender || "Unknown",
            email: m.from?.address || m.senderEmail || m.email || "unknown@domain.com",
            subject: m.subject || "(no subject)",
            date: m.date ? new Date(m.date).toLocaleDateString() : "Today",
            time: m.date ? new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            text: m.text || "",
            html: m.html || "",
            isRead: m.isRead,
            isStarred: m.isStarred,
            priority: m.priority || "normal",
            spfStatus: m.spfStatus || "pass",
            dkimStatus: m.dkimStatus || "pass",
            dmarcStatus: m.dmarcStatus || "pass",
            attachments: (m.attachments || []).map((att: any) => ({
              filename: att.filename || "file",
              size: att.size || 0,
              contentType: att.contentType || "application/octet-stream",
              downloadUrl: att.downloadUrl,
              content: att.content,
            })),
          });
        } else {
          router.replace("/inbox");
        }
      })
      .catch((err) => {
        console.error("Failed to load email message:", err);
        if (isMounted) router.replace("/inbox");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  if (loading || !email) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <Component key={email.id} email={email} />;
}
