"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/navigation";
import { MenuIcon } from "@/icons";

export default function InboxMobileHeader() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const title = pathname.includes("inbox-details") ? "Inbox Details" : "Inbox";

  return (
    <div className="flex shrink-0 items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 ps-5 xl:hidden dark:border-gray-800 dark:bg-gray-900">
      <span className="text-lg font-medium text-gray-800 dark:text-white/90">
        {title}
      </span>

      <Button
        size="icon-lg"
        variant="outline"
        onClick={toggleSidebar}
        aria-label="Open email folders menu"
      >
        <MenuIcon className="size-6" />
      </Button>
    </div>
  );
}
