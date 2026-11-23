"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="px-5 pt-5 pb-6">
      <Link
        href="/inbox"
        className={cn(
          "flex items-center gap-3",
          !showContent ? "justify-center" : "justify-start",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 font-bold text-white shadow-theme-xs">
          C
        </div>
        {showContent && (
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              CellsInbox
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
