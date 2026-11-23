"use client";

import ActivityHeader from "./activity-header";
import ActivityItemRow from "./activity-item";
import { activitiesData } from "./data";

export default function Activities() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <ActivityHeader />

      <div className="flex flex-col gap-6">
        {activitiesData.map((item, index) => (
          <ActivityItemRow
            key={item.id}
            item={item}
            isLast={index === activitiesData.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
