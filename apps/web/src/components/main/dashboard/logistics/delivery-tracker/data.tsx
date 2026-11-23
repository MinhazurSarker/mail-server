import { BoxTappedIcon, MovingBoxIcon, TruckDeliveryIcon } from "@/icons";
import type { TrackingDeliveryData } from "./types";

export const defaultDeliveryTrackerData: TrackingDeliveryData = {
  trackingId: "#28745-72809bjk",
  statusKey: "inTransit",
  steps: [
    {
      id: "step-1",
      titleKey: "pickedUp",
      date: "12 Apr 2028",
      time: "12:54",
      status: "completed",
      icon: <BoxTappedIcon className="size-5" />,
    },
    {
      id: "step-2",
      titleKey: "inTransit",
      date: "12 Apr 2028",
      time: "12:54",
      status: "current",
      icon: <TruckDeliveryIcon className="size-5" />,
    },
    {
      id: "step-3",
      titleKey: "delivered",
      date: "13 Apr 2028",
      time: "--:--",
      status: "upcoming",
      icon: <MovingBoxIcon className="size-5" />,
    },
  ],
  courier: {
    name: "Devid walthen",
    roleKey: "courier",
    avatar: "/images/logistics/avatar-1.png",
  },
};
