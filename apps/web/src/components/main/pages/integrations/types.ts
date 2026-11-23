import * as React from "react";

export interface IntegrationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  connect: boolean;
  appName?: string;
  clientId?: string;
  clientSecret?: string;
  authBaseUri?: string;
}

export interface IntegrationCardProps {
  integration: IntegrationItem;
  onToggleConnect?: (id: string, connect: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateSettings?: (id: string, settings: { clientId: string; clientSecret: string; authBaseUri: string }) => void;
}

export interface AddIntegrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { app: string; clientId: string; clientSecret: string; authBaseUri: string }) => void;
}

export interface IntegrationDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationItem;
}

export interface IntegrationSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationItem;
  onSave?: (settings: { clientId: string; clientSecret: string; authBaseUri: string }) => void;
}

export interface IntegrationDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export interface IntegrationsProps {
  className?: string;
  initialData?: IntegrationItem[];
  onAddIntegration?: (data: { app: string; clientId: string; clientSecret: string; authBaseUri: string }) => void;
  onDeleteIntegration?: (id: string) => void;
  onToggleIntegration?: (id: string, connect: boolean) => void;
}
