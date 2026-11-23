"use client";

import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import React, { useId, useMemo, useRef, useState } from "react";
import { JobStatisticsChartProps } from "./types";

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy - r * Math.sin(angleInRadians),
  };
}

function createArcSegment(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
  startRadius = 0,
  endRadius = 0,
) {
  if (startAngle <= endAngle) return "";

  const dOuterStart =
    startRadius > 0 ? (startRadius / rOuter) * (180 / Math.PI) : 0;
  const dInnerStart =
    startRadius > 0 ? (startRadius / rInner) * (180 / Math.PI) : 0;
  const dOuterEnd = endRadius > 0 ? (endRadius / rOuter) * (180 / Math.PI) : 0;
  const dInnerEnd = endRadius > 0 ? (endRadius / rInner) * (180 / Math.PI) : 0;

  // Start radial points
  const p1 = polarToCartesian(cx, cy, rInner + startRadius, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter - startRadius, startAngle);

  // Outer arc start and end
  const pOuterStart = polarToCartesian(cx, cy, rOuter, startAngle - dOuterStart);
  const pOuterEnd = polarToCartesian(cx, cy, rOuter, endAngle + dOuterEnd);

  // End radial points
  const pEndOuter = polarToCartesian(cx, cy, rOuter - endRadius, endAngle);
  const pEndInner = polarToCartesian(cx, cy, rInner + endRadius, endAngle);

  // Inner arc end and start
  const pInnerEnd = polarToCartesian(cx, cy, rInner, endAngle + dInnerEnd);
  const pInnerStart = polarToCartesian(cx, cy, rInner, startAngle - dInnerStart);

  const parts: string[] = [];

  // Start at inner radial point
  parts.push(`M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`);
  parts.push(`L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);

  if (startRadius > 0) {
    parts.push(
      `A ${startRadius} ${startRadius} 0 0 1 ${pOuterStart.x.toFixed(2)} ${pOuterStart.y.toFixed(2)}`,
    );
  }

  // Outer arc
  parts.push(
    `A ${rOuter} ${rOuter} 0 0 1 ${pOuterEnd.x.toFixed(2)} ${pOuterEnd.y.toFixed(2)}`,
  );

  if (endRadius > 0) {
    parts.push(
      `A ${endRadius} ${endRadius} 0 0 1 ${pEndOuter.x.toFixed(2)} ${pEndOuter.y.toFixed(2)}`,
    );
    parts.push(`L ${pEndInner.x.toFixed(2)} ${pEndInner.y.toFixed(2)}`);
    parts.push(
      `A ${endRadius} ${endRadius} 0 0 1 ${pInnerEnd.x.toFixed(2)} ${pInnerEnd.y.toFixed(2)}`,
    );
  } else {
    parts.push(`L ${pEndInner.x.toFixed(2)} ${pEndInner.y.toFixed(2)}`);
  }

  // Inner arc
  parts.push(
    `A ${rInner} ${rInner} 0 0 0 ${pInnerStart.x.toFixed(2)} ${pInnerStart.y.toFixed(2)}`,
  );

  if (startRadius > 0) {
    parts.push(
      `A ${startRadius} ${startRadius} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    );
  }

  parts.push("Z");
  return parts.join(" ");
}

export default function JobStatisticsChart({
  totalJobs = 120,
  metrics,
  className,
}: JobStatisticsChartProps) {
  const t = useTranslations("hr.jobStatistics");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const clipId = useId();

  const [tooltip, setTooltip] = useState<{
    label: string;
    value: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const activeJob = metrics?.[0]?.value ?? 64;
  const interview = metrics?.[1]?.value ?? 28;
  const hired = metrics?.[2]?.value ?? 32;

  // Geometry dimensions matching Figma (width 277.85px, height 140px, thickness ~34.73px)
  const cx = 138.87;
  const cy = 138.92;
  const rOuter = 138.87;
  const rInner = 104.14;
  const cornerRadius = 4;

  const { activePath, interviewPath, trackPath } = useMemo(() => {
    const total = totalJobs > 0 ? totalJobs : 120;
    const activeFrac = Math.min(Math.max(activeJob / total, 0), 1);
    const interviewFrac = Math.min(
      Math.max(interview / total, 0),
      1 - activeFrac,
    );

    const angleActive = 180 - activeFrac * 180;
    const angleInterview = angleActive - interviewFrac * 180;

    return {
      // Container track: start and end have border radius
      trackPath: createArcSegment(
        cx,
        cy,
        rInner,
        rOuter,
        180,
        0,
        cornerRadius,
        cornerRadius,
      ),
      // Active slice: start has no radius (clipped by container), end has radius
      activePath: createArcSegment(
        cx,
        cy,
        rInner,
        rOuter,
        180,
        angleActive,
        0,
        cornerRadius,
      ),
      // Interview slice: cumulative from 180 to angleInterview, start has no radius, end has radius
      interviewPath: createArcSegment(
        cx,
        cy,
        rInner,
        rOuter,
        180,
        angleInterview,
        0,
        cornerRadius,
      ),
    };
  }, [activeJob, interview, totalJobs, cx, cy, rInner, rOuter, cornerRadius]);

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    label: string,
    value: number,
    color: string,
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      label,
      value,
      color,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto flex h-35 w-70 items-end justify-center",
        className,
      )}
    >
      <svg
        className="overflow-visible"
        width={278}
        height={140}
        viewBox="0 0 277.734 138.923"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Container clip path: start and end have border radius and overflow is hidden */}
          <clipPath id={clipId}>
            <path d={trackPath} />
          </clipPath>
        </defs>

        {/* Clipped container holding all slices */}
        <g clipPath={`url(#${clipId})`}>
          {/* Background Container Track (Hired / Remainder) */}
          <path
            d={trackPath}
            fill={isDark ? "#1E2640" : "#F3F4F6"}
            className="cursor-pointer transition-colors duration-300 hover:opacity-90"
            onMouseMove={(e) =>
              handleMouseMove(
                e,
                t("hired"),
                hired,
                isDark ? "#4B5563" : "#D1D5DC",
              )
            }
            onMouseLeave={handleMouseLeave}
          />

          {/* Interview Slice: start has no radius, end has radius */}
          <path
            d={interviewPath}
            fill="#9CB9FF"
            className="cursor-pointer transition-all duration-200 hover:brightness-105"
            onMouseMove={(e) =>
              handleMouseMove(e, t("interview"), interview, "#9CB9FF")
            }
            onMouseLeave={handleMouseLeave}
          />

          {/* Active Job Slice: start has no radius, end has radius */}
          <path
            d={activePath}
            fill="#465FFF"
            className="cursor-pointer transition-all duration-200 hover:brightness-105"
            onMouseMove={(e) =>
              handleMouseMove(e, t("activeJob"), activeJob, "#465FFF")
            }
            onMouseLeave={handleMouseLeave}
          />
        </g>
      </svg>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transform rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {tooltip.label}:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {tooltip.value}
            </span>
          </div>
        </div>
      )}

      {/* Center Label */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
        <p className="font-outfit text-3xl font-semibold leading-tight text-gray-800 dark:text-white/90">
          {totalJobs}
        </p>
        <p className="font-outfit text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("totalJob")}
        </p>
      </div>
    </div>
  );
}
