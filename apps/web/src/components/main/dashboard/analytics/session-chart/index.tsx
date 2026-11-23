"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { HorizontalDotsIcon } from "@/icons";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const labels = ["Desktop", "Mobile", "Tablet"];
const series = [45, 65, 25];

export default function SessionChart() {
  const t = useTranslations("analytics.session");
  const tCommon = useTranslations("common");
  const selectedRef = useRef<number | null>(null);

  const options: ApexOptions = {
    colors: ["#3641f5", "#7592ff", "#dde9ff"],
    labels,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      width: 445,
      height: 290,
      events: {
        dataPointSelection: (_event, chartContext, config) => {
          const selected =
            config?.selectedDataPoints?.[config.seriesIndex ?? 0] ?? [];
          const dataPointIndex = config?.dataPointIndex;
          const isSelected =
            typeof dataPointIndex === "number" &&
            selected.includes(dataPointIndex);
          const activeIndex = isSelected ? dataPointIndex : null;
          selectedRef.current = activeIndex;

          const activeLabel =
            activeIndex !== null ? labels[activeIndex] : t("total");
          const activeVal =
            activeIndex !== null
              ? `${series[activeIndex]}`
              : `${series.reduce((a, b) => a + b, 0)}`;

          const w = (
            chartContext as unknown as {
              w?: {
                config?: ApexOptions;
                dom?: { baseEl?: HTMLElement };
              };
            }
          )?.w;
          if (w?.config?.plotOptions?.pie?.donut?.labels?.total) {
            w.config.plotOptions.pie.donut.labels.total.label = activeLabel;
          }

          const baseEl = w?.dom?.baseEl;
          if (baseEl) {
            const labelEl = baseEl.querySelector(".apexcharts-datalabel-label");
            const valEl = baseEl.querySelector(".apexcharts-datalabel-value");
            if (labelEl) labelEl.textContent = activeLabel;
            if (valEl) valEl.textContent = activeVal;
          }
        },
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: 20,
              color: "#667085",
              fontSize: "14px",
              fontWeight: "400",
            },
            value: {
              show: true,
              offsetY: -14,
              color: "#1D2939",
              fontSize: "24px",
              fontWeight: "600",
            },
            total: {
              show: true,
              showAlways: false,
              label: t("total"),
              fontSize: "14px",
              fontWeight: "400",
              color: "#667085",
              formatter: () => {
                if (selectedRef.current !== null) {
                  return `${series[selectedRef.current]}`;
                }
                return `${series.reduce((a, b) => a + b, 0)}`;
              },
            },
          },
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "darken",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 4, // Creates a gap between the series
    },

    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "14px",
      fontWeight: 400,
      markers: {
        size: 4,
        shape: "circle",
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
      labels: {
        useSeriesColors: true, // Optional: this makes each label color match the corresponding segment color
      },
    },

    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 370,
            height: 290,
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-9 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" />}
          >
            <HorizontalDotsIcon />
          </DropdownMenuTrigger>{" "}
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>{tCommon("viewMore")}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <div className="mx-auto flex justify-center" id="chartDarkStyle">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={290}
          />
        </div>
      </div>
    </div>
  );
}
