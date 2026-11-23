"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/navigation";
import { MenuIcon } from "@/icons";
import { navGroups } from "./data";

export default function MobileHeader() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const activeItem = navGroups
    .flatMap((group) => group.items)
    .find(
      (item) =>
        item.path === pathname ||
        (item.id === "account" && pathname === "/ai-settings"),
    );

  return (
    <div className="mt-4 flex shrink-0 items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 ps-5 xl:hidden dark:border-gray-800 dark:bg-white/3">
      <span className="text-lg font-medium text-gray-800 dark:text-white/90">
        {activeItem?.label || "Account"}
      </span>

      <Button
        size="icon-lg"
        variant="outline"
        onClick={toggleSidebar}
        aria-label="Open settings menu"
      >
        <MenuIcon className="size-6" />
      </Button>
    </div>
  );
}
