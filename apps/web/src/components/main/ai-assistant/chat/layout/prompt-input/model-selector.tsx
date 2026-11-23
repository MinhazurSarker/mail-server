"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronUpIcon } from "@/icons";
import { cn } from "@/utils";
import { ModelSelectorProps } from "./types";

export default function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-gray-100/60 px-2.5 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="shrink-0">{selectedModel.icon}</span>
            <span className="text-xs font-medium whitespace-nowrap sm:text-sm">
              {selectedModel.name}
            </span>
            <ChevronUpIcon className="size-4 text-gray-400" />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        side="top"
        className="w-60 min-w-0 p-1.5"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model)}
            className={cn(
              "gap-2.5",
              selectedModel.id === model.id
                ? "bg-gray-100 font-medium dark:bg-gray-800"
                : "",
            )}
          >
            <span className="shrink-0 text-black! dark:text-gray-300">
              {model.icon}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {model.name}
            </span>
            {model.badge && (
              <span className="ms-auto inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-950/60 dark:text-green-400">
                {model.badge}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
