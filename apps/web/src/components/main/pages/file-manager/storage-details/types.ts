export interface StorageCategoryItem {
  id: string;
  name: string;
  size: string;
  value: number;
  color: string;
  dotClass?: string;
}

export interface StorageCategory {
  name: string;
  size?: string;
  percentage?: number;
  color: string;
}

export interface StorageDetailsProps {
  className?: string;
  title?: string;
  freeSpace?: string;
  usedSpace?: string;
  totalSpace?: string;
  categories?: StorageCategoryItem[];
  series?: number[];
  labels?: string[];
  colors?: string[];
}

