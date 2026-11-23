"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Notification() {
  const [activityUpdates, setActivityUpdates] = useState(false);
  const [responses, setResponses] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Notification
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Activity & updates */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Activity & updates
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Stay informed about activity and team mentions
            </p>
          </div>

          <Switch
            size="sm"
            checked={activityUpdates}
            onCheckedChange={setActivityUpdates}
            aria-label="Activity & updates"
          />
        </div>

        {/* Responses */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Responses
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Get notified when AI responds to requests
            </p>
          </div>

          <Switch
            size="sm"
            checked={responses}
            onCheckedChange={setResponses}
            aria-label="Responses"
          />
        </div>

        {/* Product updates */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Product updates
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recent updates at a glance.
            </p>
          </div>

          <Switch
            size="sm"
            checked={productUpdates}
            onCheckedChange={setProductUpdates}
            aria-label="Product updates"
          />
        </div>
      </div>
    </section>
  );
}