"use client";

import { Card } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import CardHeader from "./card-header";
import ChartLegend from "./chart-legend";
import { salesCategoryData } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SalesCategoryChart() {
  const t = useTranslations("crm.salesCategory");

  const series = salesCategoryData.map((item) => item.percentage);
  const colors = salesCategoryData.map((item) => item.color);
  const labels = salesCategoryData.map((item) => t(item.titleKey));

  const options: ApexOptions = {
    colors,
    labels,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      width: 240,
      height: 240,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "72%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: 20,
              color: "#667085",
              fontSize: "14px",
              fontWeight: "400",
              formatter: () => t("total"),
            },
            value: {
              show: true,
              offsetY: -14,
              color: "#1D2939",
              fontSize: "24px",
              fontWeight: "700",
              formatter: () => "12.5K",
            },
            total: {
              show: true,
              showAlways: true,
              label: t("total"),
              fontSize: "14px",
              fontWeight: "400",
              color: "#667085",
              formatter: () => "12.5K",
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
          type: "none",
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
      width: 4,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 220,
            height: 220,
          },
        },
      },
    ],
  };

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-around sm:gap-6">
        <div className="flex justify-center" id="chartDarkStyle">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            width={240}
            height={240}
          />
        </div>

        <div className="w-full sm:w-auto">
          <ChartLegend items={salesCategoryData} />
        </div>
      </div>
    </Card>
  );
}
