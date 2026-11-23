import { cn } from "@/utils";
import { StorageCategoryItem } from "./types";

interface StorageIndicatorsProps {
  categories: StorageCategoryItem[];
}

export default function StorageIndicators({
  categories,
}: StorageIndicatorsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {categories.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={cn("size-2.5 shrink-0 rounded-full", item.dotClass)}
              style={item.dotClass ? undefined : { backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {item.name}
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {item.size}
          </span>
        </div>
      ))}
    </div>
  );
}
