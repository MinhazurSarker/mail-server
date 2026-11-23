import type { ApexOptions } from "apexcharts";

export const activeUserChartOptions: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#465FFF"],
  chart: {
    fontFamily: "Outfit, sans-serif",
    height: 140,
    type: "area",
    toolbar: {
      show: false,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 320,
        },
      },
    },
  ],
  stroke: {
    curve: "smooth",
    width: 2,
  },
  markers: {
    size: 0,
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
  },
  xaxis: {
    type: "category",
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
    title: {
      text: undefined,
    },
  },
};

export const activeUserChartSeries = [
  {
    name: "Active Users",
    data: [180, 181, 182, 184, 183, 182, 181, 182, 183, 185, 186, 183],
  },
];
