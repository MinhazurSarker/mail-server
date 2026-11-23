export interface FolderItem {
  id: string;
  title: string;
  fileCount: string | number;
  size: string;
}

export interface FolderCardProps {
  folder: FolderItem;
  className?: string;
  onViewMore?: (folder: FolderItem) => void;
  onDelete?: (folder: FolderItem) => void;
}

export interface AllFoldersProps {
  className?: string;
  initialData?: FolderItem[];
  onViewAll?: () => void;
  onViewMore?: (folder: FolderItem) => void;
  onDeleteFolder?: (folder: FolderItem) => void;
}
