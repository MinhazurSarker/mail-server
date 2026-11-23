import { ApexOptions } from "apexcharts";

export const churnSeries = [
  {
    name: "Churn Rate",
    data: [28, 27, 20, 18, 22, 24, 18],
  },
];

export const churnChartOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 42,
    sparkline: {
      enabled: true,
    },
    animations: {
      enabled: true,
      speed: 800,
    },
    toolbar: {
      show: false,
    },
  },
  colors: ["#F04438"],
  stroke: {
    curve: "smooth",
    width: 2,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.55,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  tooltip: {
    enabled: false,
  },
};
