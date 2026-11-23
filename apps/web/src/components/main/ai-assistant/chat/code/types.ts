import { ReactNode } from "react";

export interface AiMessageHeaderProps {
  name?: string;
  icon?: ReactNode;
  className?: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

export interface AiMessageProps {
  modelName?: string;
  modelIcon?: ReactNode;
  description?: string;
  code: string;
  language: string;
  showLineNumbers?: boolean;
  footerNote?: string;
  className?: string;
}

export interface CodeChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  isEditable?: boolean;
  description?: string;
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
  footerNote?: string;
}
