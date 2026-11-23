import { ReactNode } from "react";

export interface AiMessageHeaderProps {
  name?: string;
  icon?: ReactNode;
  className?: string;
}

export interface ImageCardProps {
  src: string;
  alt?: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  className?: string;
}

export interface AiMessageProps {
  modelName?: string;
  modelIcon?: ReactNode;
  description?: string;
  imageSrc: string;
  imageAlt?: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  className?: string;
}

export interface ImageChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  isEditable?: boolean;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}
