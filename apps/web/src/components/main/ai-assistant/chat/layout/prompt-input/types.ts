import { ReactNode } from "react";

export type GeneratorMode = "text" | "image" | "code" | "video";

export interface ModelOption {
  id: string;
  name: string;
  icon: ReactNode;
  badge?: string;
}

export type SearchMode = "web" | "deep";

export interface AspectRatioOption {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface AiPromptInputProps {
  mode?: GeneratorMode;
  onSend?: (
    prompt: string,
    model: string,
    options?: {
      searchMode?: SearchMode;
      aspectRatio?: string;
      imageCount?: number;
      resolution?: string;
      duration?: string;
      sound?: boolean;
    },
  ) => void;
}

export interface AttachButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
}

export interface TextControlsProps {
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  onUploadClick: () => void;
}

export interface ImageControlsProps {
  aspectRatio: string;
  onAspectRatioChange: (val: string) => void;
  imageCount: number;
  onImageCountChange: (val: number) => void;
  resolution: string;
  onResolutionChange: (val: string) => void;
  onUploadClick: () => void;
}

export interface CodeControlsProps {
  onUploadClick: () => void;
}

export interface VideoControlsProps {
  aspectRatio: string;
  onAspectRatioChange: (val: string) => void;
  resolution: string;
  onResolutionChange: (val: string) => void;
  duration: string;
  onDurationChange: (val: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUploadClick: () => void;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
}

export interface SubmitButtonProps {
  isSend: boolean;
  onClick: () => void;
}

