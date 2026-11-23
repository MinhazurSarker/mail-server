"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellIcon, LayoutGridIcon, UsersIcon } from "@/icons";
import { AnalyticsIcon } from "./icons";

interface TabItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const tabs: TabItem[] = [
  {
    key: "overview",
    title: "Overview",
    icon: <LayoutGridIcon />,
    content:
      "Lorem ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
  },
  {
    key: "notification",
    title: "Notification",
    icon: <BellIcon />,
    content:
      "Lorem ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
  },
  {
    key: "analytics",
    title: "Analytics",
    icon: <AnalyticsIcon />,
    content:
      "Lorem ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
  },
  {
    key: "customers",
    title: "Customers",
    icon: <UsersIcon />,
    content:
      "Lorem ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
  },
];

export default function TabWithUnderlineAndIcon() {
  return (
    <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.icon}
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <h3 className="mb-1 text-theme-xl font-medium text-gray-800 dark:text-white/90">
              {tab.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tab.content}
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
