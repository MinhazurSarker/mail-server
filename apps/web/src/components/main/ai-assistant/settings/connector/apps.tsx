"use client";

import React, { useState } from "react";
import AppItem from "./app-item";
import {
  CalendarIcon,
  GithubIcon,
  GoogleDriveIcon,
  SlackIcon,
} from "./icons";

interface AppData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
}

const initialApps: AppData[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sync files and collaborate seamlessly with your team.",
    icon: <GoogleDriveIcon />,
    connected: true,
  },
  {
    id: "github",
    name: "Github",
    description: "Automate workflows by connecting apps and services.",
    icon: <GithubIcon />,
    connected: false,
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Manage events, and optimize your time.",
    icon: <CalendarIcon />,
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Integrate Slack to simplify communication and enhance teamwork.",
    icon: <SlackIcon />,
    connected: false,
  },
];

export default function Apps() {
  const [apps, setApps] = useState<AppData[]>(initialApps);

  const handleToggleConnect = (id: string) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === id ? { ...app, connected: !app.connected } : app
      )
    );
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Apps
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {apps.map((app, index) => (
          <AppItem
            key={app.id}
            name={app.name}
            description={app.description}
            icon={app.icon}
            connected={app.connected}
            onToggle={() => handleToggleConnect(app.id)}
            isLast={index === apps.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
