"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon, TrashBinIcon } from "@/icons";

export default function DangerZone() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Danger Zone
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Logout all devices */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Logout all devices
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sign out from every active session.
            </p>
          </div>

          <Button type="button" variant="outline" size="sm">
            <LogOutIcon className="size-5 rtl:rotate-180" />
            <span>Logout All</span>
          </Button>
        </div>

        {/* Delete account */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Delete account
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently remove your account and all data.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-300 text-red-500 shadow-theme-xs hover:bg-red-50 hover:text-red-600 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <TrashBinIcon className="size-5 text-red-500 dark:text-red-400" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
