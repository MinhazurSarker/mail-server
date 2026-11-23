export interface ApiKey {
  id: string;
  name: string;
  value: string;
  status: "Active" | "Disabled";
  created: string;
  lastUsed: string;
  hasToggle: boolean;
}

export interface ApiKeyRowProps {
  apiKey: ApiKey;
  onToggleStatus?: (id: string, enabled: boolean) => void;
  onRegenerate?: (apiKey: ApiKey) => void;
  onDelete?: (id: string) => void;
}

export interface AddApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (name: string) => void;
}

export interface ApiKeyTableProps {
  className?: string;
  initialData?: ApiKey[];
  onAddKey?: (name: string) => void;
  onDeleteKey?: (id: string) => void;
  onToggleKey?: (id: string, enabled: boolean) => void;
}
