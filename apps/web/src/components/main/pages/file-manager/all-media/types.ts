import * as React from "react";

export interface MediaItem {
  id: string;
  title: string;
  usage: string;
  fileCount: number;
  storageUsed: string;
  iconStyle: string;
  icon: React.ReactNode;
}

export interface MediaCardProps {
  item: MediaItem;
  className?: string;
}

export interface AllMediaProps {
  className?: string;
  initialData?: MediaItem[];
  onUpload?: () => void;
  onSearch?: (query: string) => void;
}
