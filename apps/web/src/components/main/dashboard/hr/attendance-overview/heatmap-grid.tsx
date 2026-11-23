"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  attendanceDayKeys,
  attendanceHeatmapData,
  levelColorMap,
} from "./data";
import { AttendanceLevel, HeatmapGridProps, TooltipState } from "./types";

export default function HeatmapGrid({
  data = attendanceHeatmapData,
}: HeatmapGridProps = {}) {
  const t = useTranslations("hr.attendanceOverview");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    level: AttendanceLevel,
    day: string,
    time: string,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const wrapper = e.currentTarget.closest(
      ".hm-wrapper",
    ) as HTMLElement | null;
    if (!wrapper) return;
    const wRect = wrapper.getBoundingClientRect();
    const cellLeft = rect.left - wRect.left;
    const cellRight = rect.right - wRect.left;
    const cellCenter = cellLeft + rect.width / 2;
    const wrapperWidth = wRect.width;

    let x: number;
    let align: "center" | "left" | "right";

    if (cellCenter < 80) {
      // Near left edge: anchor to cell left so tooltip expands inward to the right
      x = Math.max(2, cellLeft);
      align = "left";
    } else if (wrapperWidth - cellCenter < 80) {
      // Near right edge: anchor to cell right so tooltip expands inward to the left
      x = Math.min(wrapperWidth - 2, cellRight);
      align = "right";
    } else {
      x = cellCenter;
      align = "center";
    }

    const yOffset = rect.top - wRect.top;
    const placement: "top" | "bottom" = yOffset < 36 ? "bottom" : "top";

    setTooltip({
      day,
      time,
      level,
      x,
      y: placement === "bottom" ? yOffset + rect.height + 6 : yOffset - 6,
      placement,
      align,
    });
  };

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <div
        className="hm-wrapper relative min-w-105 select-none"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Hover Tooltip */}
        {tooltip && (
          <div
            className={cn(
              "pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium whitespace-nowrap text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
              tooltip.placement === "top"
                ? "-translate-y-full"
                : "translate-y-0",
              tooltip.align === "left" && "translate-x-0",
              tooltip.align === "right" && "-translate-x-full",
              (!tooltip.align || tooltip.align === "center") &&
                "-translate-x-1/2",
            )}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {tooltip.day}
            </span>
            <span className="mx-1 text-gray-400 dark:text-gray-500">·</span>
            <span>{tooltip.time}</span>
          </div>
        )}

        <div className="flex gap-4">
          {/* Y-axis Time Labels */}
          <div className="flex flex-col gap-2 text-xs text-gray-500 select-none dark:text-gray-400">
            {data.map((row) => (
              <div
                key={row.time}
                className="flex h-8 items-center leading-none whitespace-nowrap sm:h-9"
              >
                {row.time}
              </div>
            ))}
          </div>

          {/* Heatmap Matrix & X-axis Day Labels */}
          <div className="flex flex-1 flex-col">
            {/* Heatmap Matrix */}
            <div className="flex flex-col gap-1">
              {data.map((row) => (
                <div key={row.time} className="flex gap-2">
                  {row.levels.map((level, colIndex) => {
                    const dayName = t(`days.${attendanceDayKeys[colIndex]}`);
                    return (
                      <div key={colIndex} className="flex-1">
                        <div
                          onMouseEnter={(e) =>
                            handleMouseEnter(e, level, dayName, row.time)
                          }
                          className={cn(
                            "h-8 w-full cursor-pointer rounded-lg transition-all duration-200 hover:opacity-80 sm:h-9",
                            levelColorMap[level],
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* X-axis Day Labels */}
            <div className="mt-4 flex gap-2 text-center text-xs font-normal text-gray-500 dark:text-gray-400">
              {attendanceDayKeys.map((dayKey) => (
                <span key={dayKey} className="flex-1">
                  {t(`days.${dayKey}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
