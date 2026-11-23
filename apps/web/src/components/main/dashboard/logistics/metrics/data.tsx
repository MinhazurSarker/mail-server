import { BoxTappedIcon, MovingBoxIcon, TruckDeliveryIcon } from "@/icons";
import { MetricItem } from "./types";

export const logisticsMetricsData: MetricItem[] = [
  {
    id: 1,
    titleKey: "totalOrders",
    value: "12,384",
    change: "+20%",
    direction: "up",
    icon: <BoxTappedIcon className="size-7" />,
  },
  {
    id: 2,
    titleKey: "ordersInTransit",
    value: "728",
    change: "+20%",
    direction: "up",
    icon: <TruckDeliveryIcon className="size-7" />,
  },
  {
    id: 3,
    titleKey: "totalOrders",
    value: "12,384",
    change: "+20%",
    direction: "up",
    icon: <MovingBoxIcon className="size-7" />,
  },
];
