import { ActivityItem } from "./types";

export const activitiesData: ActivityItem[] = [
  {
    id: "1",
    user: {
      name: "Francisco Grbbs",
      avatar: "/images/user/user-01.jpg",
    },
    badge: {
      textKey: "newInvoice",
    },
    actionKey: "createdInvoice",
    target: "PQ-4491C",
    timestamp: "Just Now",
  },
  {
    id: "2",
    user: {
      name: "Courtney Henry",
      avatar: "/images/user/user-03.jpg",
    },
    actionKey: "createdInvoice",
    target: "HK-234G",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: {
      name: "Bessie Cooper",
      avatar: "/images/user/user-04.jpg",
    },
    actionKey: "createdInvoice",
    target: "LH-2891C",
    timestamp: "5 months ago",
  },
  {
    id: "4",
    user: {
      name: "Theresa Web",
      avatar: "/images/user/user-05.jpg",
    },
    actionKey: "createdInvoice",
    target: "CK-125NH",
    timestamp: "2 week ago",
  },
];
