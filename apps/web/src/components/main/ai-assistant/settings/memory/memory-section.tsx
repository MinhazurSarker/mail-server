"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function MemorySection() {
  const [enableMemory, setEnableMemory] = useState(true);
  const [saveConversations, setSaveConversations] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Memory
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Enable memory */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Enable memory
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Allow the assistant to recall past context
            </p>
          </div>

          <Switch
            size="sm"
            checked={enableMemory}
            onCheckedChange={setEnableMemory}
            aria-label="Enable memory"
          />
        </div>

        {/* Save conversations */}
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Save conversations
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep chat history for future reference
            </p>
          </div>

          <Switch
            size="sm"
            checked={saveConversations}
            onCheckedChange={setSaveConversations}
            aria-label="Save conversations"
          />
        </div>
      </div>
    </section>
  );
}
