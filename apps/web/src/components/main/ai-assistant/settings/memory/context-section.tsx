"use client";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChatIcon, DocIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";

const importOptions = [
  {
    id: "add-memory",
    label: "Add Memory",
    icon: DocIcon,
  },
  {
    id: "import-chats",
    label: "Import Chats",
    icon: ChatIcon,
  },
  {
    id: "create-folder",
    label: "Create Folder",
    icon: PlusIcon,
  },
];

export default function ContextSection() {
  const [selectedOption, setSelectedOption] = useState("add-memory");

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Stored Context
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Import Chat Histories */}
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-medium text-gray-800 dark:text-white/90">
            Import Chat Histories
          </h3>

          <ToggleGroup
            value={[selectedOption]}
            onValueChange={(values) => {
              if (values.length > 0 && values[0]) {
                setSelectedOption(values[0]);
              }
            }}
            className="grid w-full grid-cols-1 gap-1.5 rounded-2xl border border-gray-200 bg-gray-100 p-1.5 sm:grid-cols-3 dark:border-gray-700/80 dark:bg-gray-800/60"
          >
            {importOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;

              return (
                <ToggleGroupItem
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "flex h-auto w-full flex-col items-start justify-start gap-2 rounded-xl p-4 text-start transition",
                    isSelected
                      ? "border border-brand-500 bg-white data-pressed:bg-white data-pressed:text-brand-500 data-pressed:shadow-theme-xs data-pressed:hover:text-brand-500 data-pressed:dark:border-brand-500 data-pressed:dark:bg-gray-900 data-pressed:dark:text-brand-400 data-pressed:dark:hover:bg-gray-900 data-pressed:dark:hover:text-brand-400"
                      : "border border-transparent bg-white text-gray-500 hover:bg-white/80 hover:text-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/80 dark:hover:text-white",
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="text-base font-normal">{option.label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>

        {/* Clear Memory */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Clear Memory
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently delete all stored facts and preferences
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
