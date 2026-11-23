import { ClaudeIcon, GeminiIcon, GptIcon, GrokIcon } from "@/icons";
import type { ModelData } from "./types";

export const initialModels: ModelData[] = [
  {
    id: "chatgpt-5-5",
    name: "ChatGPT 5.5",
    provider: "OpenAI",
    generation: "Text",
    icon: GptIcon,
    badge: "New",
    enabled: false,
  },
  {
    id: "chatgpt-4-5",
    name: "ChatGPT 4.5",
    provider: "OpenAI",
    generation: "Text",
    icon: GptIcon,
    enabled: true,
  },
  {
    id: "claude-sonnet-4-6-new",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    generation: "Text",
    icon: ClaudeIcon,
    badge: "New",
    enabled: false,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    generation: "Text",
    icon: ClaudeIcon,
    enabled: false,
  },
  {
    id: "gemini-3-1-pro",
    name: "Gemini 3.1 Pro",
    provider: "Google",
    generation: "Text",
    icon: GeminiIcon,
    enabled: false,
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    generation: "Text",
    icon: GeminiIcon,
    enabled: false,
  },
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xAI",
    generation: "Text",
    icon: GrokIcon,
    enabled: false,
  },
  {
    id: "grok-2-0",
    name: "Grok 2.0",
    provider: "xAI",
    generation: "Text",
    icon: GrokIcon,
    enabled: false,
  },
];

export const PROVIDER_OPTIONS = [
  "All",
  "OpenAI",
  "Google",
  "Anthropic",
  "xAI",
] as const;

export const GENERATION_OPTIONS = [
  "All",
  "Text",
  "Image",
  "Video",
  "Code",
] as const;
