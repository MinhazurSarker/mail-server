import { ApiKey } from "./types";

export const defaultApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API key",
    value: "sk_live_**********4248",
    status: "Disabled",
    created: "25 Jan, 2025",
    lastUsed: "Today, 10:45 AM",
    hasToggle: true,
  },
  {
    id: "2",
    name: "Development API key",
    value: "dev_live_**********4923",
    status: "Active",
    created: "29 Dec, 2024",
    lastUsed: "Today, 12:40 AM",
    hasToggle: false,
  },
  {
    id: "3",
    name: "Legacy API Key",
    value: "leg_live_**********0932",
    status: "Active",
    created: "12 Mar, 2024",
    lastUsed: "Today, 11:45 PM",
    hasToggle: false,
  },
];
