"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Security() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Security
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Change password */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Change password
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated 2 months ago
            </p>
          </div>

          <Button type="button" variant="outline" size="sm">
            Update password
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:items-center dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add an extra layer of security
            </p>
          </div>

          <Switch
            size="sm"
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            aria-label="Two-Factor Authentication"
          />
        </div>

        {/* Active sessions */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Active sessions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              3 devices currently signed in
            </p>
          </div>

          <Button type="button" variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </div>
    </section>
  );
}
