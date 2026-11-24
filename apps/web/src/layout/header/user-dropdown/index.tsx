"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ChevronDownIcon,
  GearIcon,
  LogOutIcon,
  UserCircleIcon,
  LayoutGridIcon,
  TableIcon,
} from "@/icons";
import { cn } from "@/utils";
import { useEffect, useState } from "react";
import { rpcCall } from "@/lib/api";
import {
  getActiveAccount,
  getStoredAccounts,
  saveAccount,
  switchAccount,
  removeAccount,
  type StoredAccount,
} from "@/lib/account-store";

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<StoredAccount | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    const current = getActiveAccount();
    if (current) {
      setActiveAccount(current);
      setAccounts(getStoredAccounts());
    } else {
      // Auto-recover session from token if available
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            document.cookie.match(/(?:^|;\s*)authorization=(?:Bearer\s+)?([^;]+)/)?.[1]
          : null;

      if (token) {
        rpcCall<{
          userId: string;
          email: string;
          displayName?: string;
          role: string;
          orgSlug?: string;
          orgName?: string;
          organizationId?: string;
        }>("auth", "me", {}, { Authorization: `Bearer ${token}` })
          .then((me) => {
            if (me && me.email) {
              const recovered: StoredAccount = {
                userId: me.userId,
                email: me.email,
                displayName: me.displayName || me.email.split("@")[0],
                role: me.role,
                orgSlug: me.orgSlug,
                orgName: me.orgName,
                organizationId: me.organizationId,
                token,
              };
              saveAccount(recovered);
              setActiveAccount(recovered);
              setAccounts(getStoredAccounts());
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const handleSignOut = () => {
    if (activeAccount) {
      removeAccount(activeAccount.userId);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("activeAccountId");
      document.cookie = "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    router.push("/login");
  };

  const handleSwitch = (userId: string) => {
    switchAccount(userId);
    window.location.reload();
  };

  const displayName = activeAccount?.displayName || activeAccount?.email?.split("@")[0] || "Account";
  const email = activeAccount?.email || "";
  const initial = (displayName || "A").charAt(0).toUpperCase();
  const isPlatformAdmin = activeAccount?.role === "PLATFORM_ADMIN" || activeAccount?.role === "SOVEREIGN_ADMIN";
  const orgSlug = activeAccount?.orgSlug || "cellsweb";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400 cursor-pointer">
        <span className="me-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 font-bold text-white text-sm shadow-theme-xs">
          {initial}
        </span>

        <span className="me-1 hidden text-sm font-medium sm:block text-gray-800 dark:text-white/90">
          {displayName}
        </span>

        <ChevronDownIcon
          className={cn(
            "size-5 text-gray-500 duration-200 dark:text-gray-400",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={12} className="w-65 p-3">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
              {displayName}
            </span>
            {activeAccount?.role && (
              <Badge variant="light" color="primary" size="sm" className="text-[10px]">
                {activeAccount.role}
              </Badge>
            )}
          </div>
          <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <DropdownMenuSeparator />

        {/* Multi-Account Switching */}
        {accounts.length > 1 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Switch Account
            </div>
            {accounts.map((acc) => (
              <DropdownMenuItem
                key={acc.userId}
                onClick={() => handleSwitch(acc.userId)}
                className={cn(
                  "flex items-center justify-between py-1.5",
                  acc.userId === activeAccount?.userId && "bg-brand-50/50 font-medium dark:bg-brand-500/10",
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="size-2 rounded-full bg-brand-500" />
                  <span className="truncate text-xs">{acc.email}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem render={<Link href="/settings" />}>
          <GearIcon className="size-5" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href={`/org/${orgSlug}/admin`} />}>
          <TableIcon className="size-5" />
          Tenant Admin
        </DropdownMenuItem>

        {isPlatformAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <LayoutGridIcon className="size-5" />
            Platform Governance
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleSignOut} className="cursor-pointer">
          <LogOutIcon className="size-5" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
