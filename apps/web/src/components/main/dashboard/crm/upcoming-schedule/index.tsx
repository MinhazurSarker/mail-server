"use client";

import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useState } from "react";
import CardHeader from "./card-header";
import { initialScheduleItems } from "./data";
import ScheduleItemRow from "./schedule-item";

export default function UpcomingSchedule() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    "wed-11-jan": false,
    "fri-15-feb": false,
    "thu-18-mar": false,
  });

  const handleToggle = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  return (
    <Card className="h-full gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-125 xl:min-w-full">
          <FieldGroup className="gap-2">
            {initialScheduleItems.map((item) => (
              <ScheduleItemRow
                key={item.id}
                item={item}
                checked={checkedItems[item.id] ?? false}
                onToggle={(checked) => handleToggle(item.id, checked)}
              />
            ))}
          </FieldGroup>
        </div>
      </div>
    </Card>
  );
}
