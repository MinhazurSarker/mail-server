"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
import CardHeader from "./card-header";
import { watchlistData } from "./data";
import WatchlistItem from "./watchlist-item";

export default function Watchlist() {
  return (
    <Card className={cn("gap-6 rounded-2xl p-6")}>
      <CardHeader />
      <CardContent className="p-0">
        <ScrollArea className="h-79 *:data-[slot=scroll-area-scrollbar]:-me-1.25">
          <div className="flex flex-col pe-3">
            {watchlistData.map((item) => (
              <WatchlistItem key={item.id} {...item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
