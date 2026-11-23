import { AmazonIcon, AppleIcon, PaypalIcon, TeslaIcon } from "@/icons";
import { StockMetricItem } from "./types";

export const stockMetricsData: StockMetricItem[] = [
  {
    id: 1,
    symbol: "AAPL",
    companyName: "Apple, Inc",
    price: "$1,232.00",
    change: "11.01%",
    direction: "up",
    logoBg: "#283544",
    icon: <AppleIcon />,
  },
  {
    id: 2,
    symbol: "PYPL",
    companyName: "Paypal, Inc",
    price: "$965.00",
    change: "9.05%",
    direction: "down",
    logoBg: "#1B4BF1",
    icon: <PaypalIcon />,
  },
  {
    id: 3,
    symbol: "TSLA",
    companyName: "Tesla, Inc",
    price: "$1,232.00",
    change: "11.01%",
    direction: "up",
    logoBg: "#E31937",
    icon: <TeslaIcon />,
  },
  {
    id: 4,
    symbol: "AMZN",
    companyName: "Amazon.com, Inc",
    price: "$2,567.99",
    change: "11.01%",
    direction: "up",
    logoBg: "#000000",
    icon: <AmazonIcon />,
  },
];
