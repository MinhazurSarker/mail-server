"use client";

import { cn } from "@/utils";
import { useMemo, useState } from "react";
import { buildMatrix, columnLabels, getCellColorClass } from "./data";
import { TooltipState } from "./types";

export default function HeatmapGrid() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const matrix = useMemo(() => buildMatrix(), []);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    value: number,
    col: number,
  ) => {
    if (value === 0) return;
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

    if (cellCenter < 40) {
      x = Math.max(0, cellLeft);
      align = "left";
    } else if (wrapperWidth - cellCenter < 40) {
      x = Math.min(wrapperWidth, cellRight);
      align = "right";
    } else {
      x = cellCenter;
      align = "center";
    }

    const yOffset = rect.top - wRect.top;
    const placement: "top" | "bottom" = yOffset < 36 ? "bottom" : "top";

    setTooltip({
      col,
      value,
      x,
      y: placement === "bottom" ? yOffset + rect.height + 6 : yOffset - 6,
      placement,
      align,
    });
  };

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <div
        className="hm-wrapper relative min-w-70 select-none"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Hover Tooltip */}
        {tooltip && (
          <div
            className={cn(
              "pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
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
            <span>{tooltip.col + 1}</span>: {tooltip.value}%
          </div>
        )}

        {/* Heatmap Matrix */}
        <div className="flex flex-col gap-0.5">
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5">
              {row.map((value, colIdx) => (
                <div key={colIdx} className="flex-1">
                  {value > 0 ? (
                    <div
                      onMouseEnter={(e) => handleMouseEnter(e, value, colIdx)}
                      className={cn(
                        "h-4.25 w-full cursor-pointer rounded-xs transition-opacity hover:opacity-80",
                        getCellColorClass(value),
                      )}
                    />
                  ) : (
                    <div className="h-4.25 w-full bg-transparent" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* X-axis Labels */}
        <div className="mt-4 flex gap-0.5 text-center text-xs text-gray-400 dark:text-gray-500">
          {columnLabels.map((label) => (
            <span key={label} className="flex-1">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
