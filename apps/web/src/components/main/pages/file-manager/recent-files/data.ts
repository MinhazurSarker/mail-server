import { FileImageIcon, FilePdfIcon, FileVideoIcon } from "@/icons";
import type { RecentFileItem } from "./types";

export const defaultRecentFiles: RecentFileItem[] = [
  {
    id: "1",
    fileName: "Video_947954.mp4",
    fileIcon: FileVideoIcon,
    category: "Video",
    size: "89 MB",
    dateModified: "12 Jan, 2027",
  },
  {
    id: "2",
    fileName: "Travel.jpg",
    fileIcon: FileImageIcon,
    category: "Image",
    size: "5.4 MB",
    dateModified: "10 Feb, 2027",
  },
  {
    id: "3",
    fileName: "Document.pdf",
    fileIcon: FilePdfIcon,
    category: "Document",
    size: "1.2 MB",
    dateModified: "8 Mar, 2027",
  },
  {
    id: "4",
    fileName: "Video_947954_028.mp4",
    fileIcon: FileVideoIcon,
    category: "Video",
    size: "489 MB",
    dateModified: "29 Apr, 2027",
  },
  {
    id: "5",
    fileName: "Mountain.png",
    fileIcon: FileImageIcon,
    category: "Image",
    size: "5.4 MB",
    dateModified: "10 Feb, 2027",
  },
  {
    id: "6",
    fileName: "CV.pdf",
    fileIcon: FilePdfIcon,
    category: "Document",
    size: "1.2 MB",
    dateModified: "8 Mar, 2027",
  },
];
