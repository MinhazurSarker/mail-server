"use client";

import { cn } from "@/utils";
import * as React from "react";
import AddIntegrationDialog from "./add-integration-dialog";
import { defaultIntegrations } from "./data";
import {
  GmailIcon,
  GoogleMeetIcon,
  JiraIcon,
  LinearIcon,
  LoomIcon,
  MailchimpIcon,
  NotionIcon,
  TrelloIcon,
  ZoomIcon,
} from "./icons";
import IntegrationCard from "./integration-card";
import PageHeader from "./page-header";
import { IntegrationItem, IntegrationsProps } from "./types";

function getIconForApp(appName: string): React.ReactNode {
  switch (appName.toLowerCase()) {
    case "mailchimp":
      return <MailchimpIcon />;
    case "google meet":
      return <GoogleMeetIcon />;
    case "zoom":
      return <ZoomIcon />;
    case "loom":
      return <LoomIcon />;
    case "linear":
      return <LinearIcon />;
    case "gmail":
      return <GmailIcon />;
    case "trello":
      return <TrelloIcon />;
    case "notion":
      return <NotionIcon />;
    case "jira":
      return <JiraIcon />;
    default:
      return <MailchimpIcon />;
  }
}

export default function Integrations({
  className,
  initialData = defaultIntegrations,
  onAddIntegration,
  onDeleteIntegration,
  onToggleIntegration,
}: IntegrationsProps) {
  const [integrations, setIntegrations] =
    React.useState<IntegrationItem[]>(initialData);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const handleToggle = (id: string, connect: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, connect } : item)),
    );
    onToggleIntegration?.(id, connect);
  };

  const handleDelete = (id: string) => {
    setIntegrations((prev) => prev.filter((item) => item.id !== id));
    onDeleteIntegration?.(id);
  };

  const handleUpdateSettings = (
    id: string,
    settings: { clientId: string; clientSecret: string; authBaseUri: string },
  ) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...settings } : item)),
    );
  };

  const handleAdd = (data: {
    app: string;
    clientId: string;
    clientSecret: string;
    authBaseUri: string;
  }) => {
    const newItem: IntegrationItem = {
      id: `custom-${Date.now()}`,
      title: data.app,
      description: `Connected ${data.app} integration for your team workspace.`,
      icon: getIconForApp(data.app),
      connect: true,
      appName: `${data.app} Workspace`,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      authBaseUri: data.authBaseUri,
    };
    setIntegrations((prev) => [newItem, ...prev]);
    onAddIntegration?.(data);
  };

  return (
    <div className={cn(className)}>
      <PageHeader onAddClick={() => setIsAddOpen(true)} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((item) => (
          <IntegrationCard
            key={item.id}
            integration={item}
            onToggleConnect={handleToggle}
            onDelete={handleDelete}
            onUpdateSettings={handleUpdateSettings}
          />
        ))}
      </div>

      <AddIntegrationDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}
