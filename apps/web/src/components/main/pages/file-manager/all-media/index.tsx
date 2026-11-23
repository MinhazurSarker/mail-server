"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";
import * as React from "react";
import CardHeader from "./card-header";
import { defaultMediaItems } from "./data";
import MediaCard from "./media-card";
import { AllMediaProps, MediaItem } from "./types";

export default function AllMedia({
  className,
  initialData = defaultMediaItems,
  onUpload,
  onSearch,
}: AllMediaProps) {
  const [items] = React.useState<MediaItem[]>(initialData);

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader onSearch={onSearch} onUpload={onUpload} />

      <CardContent className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { default as CardHeader } from "./card-header";
export * from "./data";
export { default as MediaCard } from "./media-card";
export * from "./types";
