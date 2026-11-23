import { StorageCategoryItem } from "./types";

export const defaultStorageCategories: StorageCategoryItem[] = [
  {
    id: "media",
    name: "Media",
    size: "35 GB",
    value: 35,
    color: "#05DF72",
    dotClass: "bg-[#05DF72]",
  },
  {
    id: "downloads",
    name: "Downloads",
    size: "59 GB",
    value: 59,
    color: "#C27AFF",
    dotClass: "bg-[#C27AFF]",
  },
  {
    id: "apps",
    name: "Apps",
    size: "37 GB",
    value: 37,
    color: "#FF8904",
    dotClass: "bg-[#FF8904]",
  },
  {
    id: "documents",
    name: "Documents",
    size: "19 GB",
    value: 19,
    color: "#FFB900",
    dotClass: "bg-[#FFB900]",
  },
];

export const defaultStorageSeries = defaultStorageCategories.map(
  (item) => item.value,
);
export const defaultStorageLabels = defaultStorageCategories.map(
  (item) => item.name,
);
export const defaultStorageColors = defaultStorageCategories.map(
  (item) => item.color,
);

export const defaultStorageMeta = {
  title: "Storage Details",
  freeSpace: "585 GB Free space left",
  usedSpace: "135 GB",
  totalSpace: "720 GB",
};

