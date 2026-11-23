import { ReactNode } from "react";

export interface AiMessageHeaderProps {
  name?: string;
  icon?: ReactNode;
  className?: string;
}

export interface AiMessageActionsProps {
  contentToCopy: string;
  onRegenerate?: () => void;
  className?: string;
}

export interface AiMessageProps {
  modelName?: string;
  modelIcon?: ReactNode;
  content: string | string[];
  onRegenerate?: () => void;
  className?: string;
}

export interface TextChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  paragraphs?: string[];
  isEditable?: boolean;
}
