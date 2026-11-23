"use client";

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

export default function SidebarWidget() {
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

  const used = quota?.used ?? 0;
  const total = quota?.total ?? 10737418240;
  const pct = Math.min(100, Math.round((used / (total || 1)) * 100));

  return (
    <div className="mb-4">
      <div className="mx-auto rounded-2xl bg-gray-50 p-4 text-start dark:bg-white/3 border border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Mailbox Storage</span>
          <span className="font-mono text-[10px] text-brand-500">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
          <span>{formatBytes(used)}</span>
          <span>{formatBytes(total)}</span>
        </div>
      </div>
    </div>
  );
}
