import type { IconProps } from "@/icons";
import type { ComponentType } from "react";

export interface RecentFileItem {
  id: string;
  fileName: string;
  fileIcon: ComponentType<IconProps>;
  category: string;
  size: string;
  dateModified: string;
}

export interface FileRowProps {
  file: RecentFileItem;
  onView?: (file: RecentFileItem) => void;
  onDelete?: (file: RecentFileItem) => void;
}

export interface RecentFilesProps {
  className?: string;
  initialData?: RecentFileItem[];
  onViewAll?: () => void;
  onViewFile?: (file: RecentFileItem) => void;
  onDeleteFile?: (file: RecentFileItem) => void;
}
