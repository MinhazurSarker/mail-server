import { ReactNode } from "react";

export interface AiMessageHeaderProps {
  name?: string;
  icon?: ReactNode;
  className?: string;
}

export interface VideoCardProps {
  thumbnailSrc: string;
  videoUrl: string;
  alt?: string;
  onRegenerate?: () => void;
  onDownload?: () => void;
  className?: string;
}

export interface AiMessageProps {
  modelName?: string;
  modelIcon?: ReactNode;
  description?: string;
  thumbnailSrc: string;
  videoUrl: string;
  alt?: string;
  onRegenerate?: () => void;
  onDownload?: () => void;
  className?: string;
}

export interface VideoChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  isEditable?: boolean;
  description?: string;
  thumbnailSrc?: string;
  videoUrl?: string;
  alt?: string;
}
