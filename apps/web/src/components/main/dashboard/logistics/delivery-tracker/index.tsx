"use client";

import { cn } from "@/utils";
import CourierCard from "./courier-card";
import { defaultDeliveryTrackerData } from "./data";
import TrackingMap from "./tracking-map";
import TrackingProgress from "./tracking-progress";
import type { DeliveryTrackerProps } from "./types";

export default function DeliveryTracker({
  data = defaultDeliveryTrackerData,
  className,
  children,
}: DeliveryTrackerProps) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-2xl border border-gray-200 bg-gray-100 p-2 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {children ?? (
        <>
          <TrackingMap />
          <TrackingProgress
            trackingId={data.trackingId}
            statusKey={data.statusKey}
            steps={data.steps}
          />
          <CourierCard courier={data.courier} />
        </>
      )}
    </div>
  );
}

export { CourierCard, TrackingMap, TrackingProgress };
export * from "./types";
