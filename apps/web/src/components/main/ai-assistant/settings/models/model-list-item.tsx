"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils";
import type { ModelData } from "./types";

interface ModelListItemProps {
  item: ModelData;
  isLast?: boolean;
  onToggle: (id: string) => void;
}

export default function ModelListItem({
  item,
  isLast = false,
  onToggle,
}: ModelListItemProps) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 transition-colors",
        !isLast && "border-b border-gray-100 dark:border-gray-800",
      )}
    >
      {/* Model Info */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="flex size-4.5 shrink-0 items-center justify-center">
          <Icon className="size-4.5" />
        </div>
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {item.name}
        </span>
        {item.badge && (
          <Badge variant="light" color="success" size="sm">
            {item.badge}
          </Badge>
        )}
      </div>

      {/* Model Toggle Switch */}
      <Switch
        size="sm"
        checked={item.enabled}
        onCheckedChange={() => onToggle(item.id)}
        aria-label={`Toggle ${item.name}`}
      />
    </div>
  );
}
