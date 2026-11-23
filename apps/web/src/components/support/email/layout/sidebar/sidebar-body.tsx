"use client";

import {
  ArchiveIcon,
  EnvelopeIcon,
  InboxIcon,
  InfoCircleIcon,
  SendIcon,
  StarIcon,
  TrashBinIcon,
  PaperClipIcon,
} from "@/icons";
import SidebarLabelItem from "./sidebar-label-item";
import SidebarNavItem from "./sidebar-nav-item";
import type { SidebarBodyProps } from "./types";
import { useEffect, useState } from "react";
import { rpcCall } from "@/lib/api";

function formatBytes(bytes: number): string {
  if (bytes === -1) return "Unlimited";
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function SidebarBody({
  onCloseMobile,
  activeFolder = "INBOX",
  onSelectFolder,
  activeLabel = null,
  onSelectLabel,
  counts = {},
}: SidebarBodyProps) {
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    rpcCall<{ storageQuotaBytes?: number; storageUsedBytes?: number }>("auth", "me", {})
      .then((res) => {
        if (res) {
          setQuota({
            used: res.storageUsedBytes || 0,
            total: res.storageQuotaBytes || 10 * 1024 * 1024 * 1024,
          });
        }
      })
      .catch(() => {});
  }, []);

  const mailboxItems = [
    { id: "INBOX", label: "Inbox", icon: InboxIcon, count: counts["INBOX"] || 0 },
    { id: "Starred", label: "Starred", icon: StarIcon, count: counts["Starred"] || 0 },
    { id: "Sent", label: "Sent", icon: SendIcon, iconClassName: "rtl:-scale-x-100", count: counts["Sent"] || 0 },
    { id: "Drafts", label: "Drafts", icon: EnvelopeIcon, count: counts["Drafts"] || 0 },
    { id: "Trash", label: "Trash", icon: TrashBinIcon, count: counts["Trash"] || 0 },
  ];

  const filterItems = [
    { id: "unread", label: "Unread", icon: EnvelopeIcon, count: counts["unread"] || 0 },
    { id: "attachments", label: "Attachments", icon: PaperClipIcon, count: counts["attachments"] || 0 },
  ];

  const labelItems = [
    { id: "vip", label: "VIP", colorClass: "text-purple-500" },
    { id: "urgent", label: "Urgent", colorClass: "text-red-500" },
    { id: "work", label: "Work", colorClass: "text-blue-500" },
    { id: "invoices", label: "Invoices", colorClass: "text-amber-500" },
    { id: "personal", label: "Personal", colorClass: "text-emerald-500" },
    { id: "projects", label: "Projects", colorClass: "text-cyan-500" },
  ];

  const used = quota?.used ?? 0;
  const total = quota?.total ?? 10737418240;
  const pct = Math.min(100, Math.round((used / (total || 1)) * 100));

  return (
    <div className="mt-4 custom-scrollbar flex-1 space-y-5 overflow-y-auto pr-1">
      {/* Mailbox Section */}
      <div>
        <h4 className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          MAILBOX
        </h4>
        <nav className="flex flex-col gap-0.5">
          {mailboxItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeFolder.toLowerCase() === item.id.toLowerCase() && !activeLabel}
              onClick={() => {
                onCloseMobile?.();
                onSelectLabel?.(null);
                onSelectFolder?.(item.id);
              }}
            />
          ))}
        </nav>
      </div>

      {/* Filter Section */}
      <div>
        <h4 className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          FILTER
        </h4>
        <nav className="flex flex-col gap-0.5">
          {filterItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeFolder.toLowerCase() === item.id.toLowerCase() && !activeLabel}
              onClick={() => {
                onCloseMobile?.();
                onSelectLabel?.(null);
                onSelectFolder?.(item.id);
              }}
            />
          ))}
        </nav>
      </div>

      {/* Label Section */}
      <div>
        <h4 className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          LABELS
        </h4>
        <div className="flex flex-col gap-0.5">
          {labelItems.map((item) => (
            <SidebarLabelItem
              key={item.id}
              item={item}
              isActive={activeLabel?.toLowerCase() === item.id.toLowerCase()}
              onClick={() => {
                onCloseMobile?.();
                onSelectLabel?.(item.id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Storage Section */}
      <div className="pt-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Storage</span>
            <span className="font-mono text-[10px] text-brand-500">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>{formatBytes(used)}</span>
            <span>{formatBytes(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
