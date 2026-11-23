import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateBackground({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-background"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <svg
        width="618"
        height="471"
        viewBox="0 0 618 471"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-[#99A1AF] dark:text-gray-700"
      >
        <defs>
          {/* Horizontal line gradients */}
          <linearGradient
            id="empty-state-h1"
            x1="0"
            y1="0"
            x2="618"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.2458" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="0.75" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id="empty-state-h-bottom"
            x1="0"
            y1="0"
            x2="618"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.2458" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.75" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          {/* Vertical line gradients */}
          <linearGradient
            id="empty-state-v-outer"
            x1="0"
            y1="0"
            x2="0"
            y2="447"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.2458" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="0.44" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="0.9" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id="empty-state-v-inner"
            x1="0"
            y1="0"
            x2="0"
            y2="262.4"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.25" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Horizontal Dashed Lines */}
        {/* Vector 1 at y = 114 */}
        <line
          x1="0"
          y1="114"
          x2="618"
          y2="114"
          stroke="url(#empty-state-h1)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />
        {/* Vector 11 at y = 184.6 */}
        <line
          x1="0"
          y1="184.6"
          x2="618"
          y2="184.6"
          stroke="url(#empty-state-h1)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />
        {/* Vector 12 at y = 261.8 */}
        <line
          x1="0"
          y1="261.8"
          x2="618"
          y2="261.8"
          stroke="url(#empty-state-h-bottom)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />

        {/* Vertical Dashed Lines */}
        {/* Vector 15 (outer left) at x = 65.2 */}
        <line
          x1="65.2"
          y1="0"
          x2="65.2"
          y2="447"
          stroke="url(#empty-state-v-outer)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />
        {/* Vector 7 (inner left) at x = 228 */}
        <line
          x1="228"
          y1="0"
          x2="228"
          y2="262.4"
          stroke="url(#empty-state-v-inner)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />
        {/* Vector 5 (inner right) at x = 391.9 */}
        <line
          x1="391.9"
          y1="0"
          x2="391.9"
          y2="262.4"
          stroke="url(#empty-state-v-inner)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />
        {/* Vector 16 (outer right) at x = 554.5 */}
        <line
          x1="554.5"
          y1="0"
          x2="554.5"
          y2="447"
          stroke="url(#empty-state-v-outer)"
          strokeWidth="0.75"
          strokeDasharray="4.25 4.25"
        />

        {/* 8 Intersection Marker Rectangles */}
        {/* Top row at y = 114 */}
        <rect
          x={65.2 - 2.41}
          y={114 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={228 - 2.41}
          y={114 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={391.9 - 2.41}
          y={114 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={554.5 - 2.41}
          y={114 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />

        {/* Bottom row at y = 261.8 */}
        <rect
          x={65.2 - 2.41}
          y={261.8 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={228 - 2.41}
          y={261.8 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={391.9 - 2.41}
          y={261.8 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
        <rect
          x={554.5 - 2.41}
          y={261.8 - 2.41}
          width="4.82"
          height="4.82"
          className="fill-gray-300 dark:fill-gray-700"
        />
      </svg>
    </div>
  );
}

export default EmptyStateBackground;
