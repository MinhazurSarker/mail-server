import React from "react";

export type ModelProvider = "OpenAI" | "Google" | "Anthropic" | "xAI";

export type ModelGeneration = "Text" | "Image" | "Video" | "Code";

export interface ModelData {
  id: string;
  name: string;
  provider: ModelProvider;
  generation: ModelGeneration;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  enabled: boolean;
}
