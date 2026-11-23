import { ApexOptions } from "apexcharts";

export const growthSeries = [
  {
    name: "User Growth",
    data: [12, 17, 16, 26, 32, 33],
  },
];

export const growthChartOptions: ApexOptions = {
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
  colors: ["#12B76A"],
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
