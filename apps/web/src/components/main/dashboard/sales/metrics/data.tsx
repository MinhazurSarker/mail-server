import {
  ArrowLeftRightIcon,
  BanknoteUndoIcon,
  DollarIcon,
  MovingBoxIcon,
} from "@/icons";
import { StatItem } from "./types";

export const chartCategories = [
  "2018-09-19T00:00:00.000Z",
  "2018-09-19T01:30:00.000Z",
  "2018-09-19T02:30:00.000Z",
  "2018-09-19T03:30:00.000Z",
  "2018-09-19T04:30:00.000Z",
  "2018-09-19T05:30:00.000Z",
  "2018-09-19T06:30:00.000Z",
  "2018-09-19T07:30:00.000Z",
  "2018-09-19T08:30:00.000Z",
  "2018-09-19T09:30:00.000Z",
  "2018-09-19T10:30:00.000Z",
  "2018-09-19T11:30:00.000Z",
  "2018-09-19T12:30:00.000Z",
];

export const defaultChartSeriesData = [
  300, 350, 310, 370, 248, 187, 295, 191, 269, 201, 185, 252, 151,
];

export const salesStatsData: StatItem[] = [
  {
    id: 1,
    titleKey: "totalRevenue",
    value: "$10,590",
    change: "32%",
    direction: "up",
    comparisonKey: "vsLastMonth",
    chartColor: "#12B76A",
    icon: <DollarIcon className="size-6 text-[#12B76A]" />,
  },
  {
    id: 2,
    titleKey: "totalSales",
    value: "1,320",
    change: "32%",
    direction: "up",
    comparisonKey: "vsLastMonth",
    chartColor: "#7C3AED",
    icon: <MovingBoxIcon className="size-6 text-[#7C3AED]" />,
  },
  {
    id: 3,
    titleKey: "conversionRate",
    value: "4.38%",
    change: "32%",
    direction: "up",
    comparisonKey: "vsLastMonth",
    chartColor: "#38BDF8",
    icon: <ArrowLeftRightIcon className="size-6 text-[#38BDF8]" />,
  },
  {
    id: 4,
    titleKey: "refundRate",
    value: "1.2%",
    change: "32%",
    direction: "up",
    comparisonKey: "vsLastMonth",
    chartColor: "#F04438",
    icon: <BanknoteUndoIcon className="size-6 text-[#F04438]" />,
  },
];
