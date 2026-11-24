"use client";

import { useEffect, useState } from "react";
import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import { rpcCall } from "@/lib/api";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  const [branding, setBranding] = useState<{
    name: string;
    logoUrl?: string;
  }>({ name: "CellsInbox" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      rpcCall<any>("auth", "branding", { host: window.location.hostname })
        .then((res) => {
          if (res && res.name) {
            setBranding({
              name: res.name || "CellsInbox",
              logoUrl: res.logoUrl,
            });
          }
        })
        .catch(() => {});

      const handleUpdate = (e: any) => {
        if (e.detail) {
          setBranding((prev) => ({
            name: e.detail.name || prev.name,
            logoUrl: e.detail.logoUrl !== undefined ? e.detail.logoUrl : prev.logoUrl,
          }));
        }
      };

      window.addEventListener("cellsinbox:branding-updated", handleUpdate);
      return () => window.removeEventListener("cellsinbox:branding-updated", handleUpdate);
    }
  }, []);

  return (
    <SidebarHeader className="px-5 pt-5 pb-6">
      <Link
        href="/inbox"
        className={cn(
          "flex items-center gap-3",
          !showContent ? "justify-center" : "justify-start",
        )}
      >
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.name}
            className="size-9 shrink-0 object-contain rounded-xl"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 font-bold text-white shadow-theme-xs">
            {branding.name.charAt(0).toUpperCase()}
          </div>
        )}
        {showContent && (
          <div className="flex flex-col truncate">
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {branding.name}
            </span>
            <span className="text-[10px] font-mono tracking-wider text-brand-500 uppercase">
              Sovereign Mail
            </span>
          </div>
        )}
      </Link>
    </SidebarHeader>
  );
}
