"use client";

import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SalesBarChartProps {
  data: number[];
  categories: string[];
}

export default function SalesBarChart({
  data,
  categories,
}: SalesBarChartProps) {
  const { theme } = useTheme();
  const t = useTranslations("saas.productPerformance");

  const maxVal = Math.max(...data);
  const yaxisMax = Math.ceil(maxVal + 1.2);

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "38%",
        borderRadius: 5,
        borderRadiusApplication: "around",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      offsetY: -20,
      style: {
        fontSize: "12px",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 400,
        colors: [theme === "dark" ? "#94A3B8" : "#364153"],
      },
      dropShadow: {
        enabled: false,
      },
    },
    stroke: {
      show: false,
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: theme === "dark" ? "#94A3B8" : "#364153",
          fontFamily: "Outfit, sans-serif",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      max: yaxisMax,
      min: 0,
      tickAmount: 4,
      labels: {
        show: false,
      },
    },
    grid: {
      borderColor: theme === "dark" ? "#1E2640" : "#F3F4F6",
      strokeDashArray: 0,
      padding: {
        left: -10,
        right: 0,
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#7592FF",
            opacity: 1,
          },
          {
            offset: 100,
            color: "#465FFF",
            opacity: 1,
          },
        ],
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
  };

  const series = [
    {
      name: t("series.sales"),
      data: [...data],
    },
  ];

  return (
    <div className="custom-scrollbar max-w-full overflow-x-auto">
      <div className="min-w-65">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={200}
        />
      </div>
    </div>
  );
}
