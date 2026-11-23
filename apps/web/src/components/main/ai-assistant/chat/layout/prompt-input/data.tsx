import {
  AspectFullscreenIcon,
  AspectPortraitIcon,
  AspectSquareIcon,
  AspectVerticalWidescreenIcon,
  AspectWidescreenIcon,
  BoltTwoIcon,
  ClaudeIcon,
  FluxIcon,
  GeminiIcon,
  GoogleIcon,
  GptIcon,
  GrokIcon,
  IdeogramIcon,
  KlingIcon,
  NanoBananaIcon,
  QwenIcon,
  RunwayIcon,
  SeedreamIcon,
} from "@/icons";
import { AspectRatioOption, GeneratorMode, ModelOption } from "./types";

export const TEXT_MODELS: ModelOption[] = [
  {
    id: "auto-select",
    name: "Auto Select Best Model",
    icon: <BoltTwoIcon className="size-4.5" />,
  },
  {
    id: "chatgpt-5.5",
    name: "ChatGPT 5.5",
    icon: <GptIcon className="size-4.5" />,
    badge: "New",
  },
  {
    id: "chatgpt-4.5",
    name: "ChatGPT 4.5",
    icon: <GptIcon className="size-4.5" />,
  },
  {
    id: "claude-4.6",
    name: "Claude Sonnet 4.6",
    icon: <ClaudeIcon className="size-4.5" />,
  },
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    icon: <ClaudeIcon className="size-4.5" />,
  },
  {
    id: "grok-3",
    name: "Grok 3",
    icon: <GrokIcon className="size-4.5" />,
  },
  {
    id: "grok-2.0",
    name: "Grok 2.0",
    icon: <GrokIcon className="size-4.5" />,
  },
];

export const IMAGE_MODELS: ModelOption[] = [
  {
    id: "auto-select",
    name: "Auto Select Best Model",
    icon: <BoltTwoIcon className="size-4.5" />,
  },
  {
    id: "nanobanana-pro",
    name: "Nano Banana Pro",
    icon: <NanoBananaIcon className="size-4.5" />,
  },
  {
    id: "gpt-5-image",
    name: "GPT-5 Image",
    icon: <GptIcon className="size-4.5" />,
  },
  {
    id: "seedream-5.0",
    name: "Seedream 5.0",
    icon: <SeedreamIcon className="size-4.5" />,
  },
  {
    id: "flux-2-pro",
    name: "FLUX.2 Pro",
    icon: <FluxIcon className="size-4.5" />,
  },
  {
    id: "grok-imagine",
    name: "Grok Imagine",
    icon: <GrokIcon className="size-4.5" />,
  },
  {
    id: "ideogram-v2",
    name: "Ideogram V2",
    icon: <IdeogramIcon className="size-4.5" />,
  },
];

export const CODE_MODELS: ModelOption[] = [
  {
    id: "auto-select",
    name: "Auto Select Best Model",
    icon: <BoltTwoIcon className="size-4.5" />,
  },
  {
    id: "chatgpt-5.5",
    name: "ChatGPT 5.5",
    icon: <GptIcon className="size-4.5" />,
    badge: "New",
  },
  {
    id: "claude-4.6",
    name: "Claude Sonnet 4.6",
    icon: <ClaudeIcon className="size-4.5" />,
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    icon: <GeminiIcon className="size-4.5" />,
  },
  {
    id: "chatgpt-4.5",
    name: "ChatGPT 4.5",
    icon: <GptIcon className="size-4.5" />,
  },
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    icon: <ClaudeIcon className="size-4.5" />,
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    icon: <GeminiIcon className="size-4.5" />,
  },
];

export const VIDEO_MODELS: ModelOption[] = [
  {
    id: "google-veo-3.1",
    name: "Google Veo 3.1",
    icon: <GoogleIcon className="size-4.5" />,
  },
  {
    id: "kling-3.0-pro",
    name: "Kling 3.0 Pro",
    icon: <KlingIcon className="size-4.5" />,
  },
  {
    id: "seedream-1.5",
    name: "Seedream 1.5",
    icon: <SeedreamIcon className="size-4.5" />,
  },
  {
    id: "runway-4.5",
    name: "Runway 4.5",
    icon: <RunwayIcon className="size-4.5" />,
  },
  {
    id: "grok-video",
    name: "xAI Grok Video",
    icon: <GrokIcon className="size-4.5" />,
  },
  {
    id: "wen-2.6",
    name: "Wen 2.6",
    icon: <QwenIcon className="size-4.5" />,
  },
];

export const IMAGE_ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: "16:9",
    label: "16:9",
    icon: <AspectWidescreenIcon className="size-4.5" />,
  },
  {
    id: "4:3",
    label: "4:3",
    icon: <AspectFullscreenIcon className="size-4.5" />,
  },
  {
    id: "1:1",
    label: "1:1",
    icon: <AspectSquareIcon className="size-4.5" />,
  },
  {
    id: "3:4",
    label: "3:4",
    icon: <AspectPortraitIcon className="size-4.5" />,
  },
  {
    id: "9:16",
    label: "9:16",
    icon: <AspectVerticalWidescreenIcon className="size-4.5" />,
  },
];

export const VIDEO_ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: "16:9",
    label: "16:9",
    icon: <AspectWidescreenIcon className="size-4.5" />,
  },
  {
    id: "4:3",
    label: "4:3",
    icon: <AspectFullscreenIcon className="size-4.5" />,
  },
  {
    id: "3:4",
    label: "3:4",
    icon: <AspectPortraitIcon className="size-4.5" />,
  },
  {
    id: "9:16",
    label: "9:16",
    icon: <AspectVerticalWidescreenIcon className="size-4.5" />,
  },
];

export const IMAGE_COUNTS = [1, 2, 3, 4];
export const IMAGE_RESOLUTIONS = ["1k", "2k", "4k"];
export const VIDEO_RESOLUTIONS = ["480p", "720p", "1080p"];
export const VIDEO_DURATIONS = ["4s", "6s", "8s", "10s"];

export const MODE_CONFIG: Record<
  GeneratorMode,
  {
    placeholder: string;
    models: ModelOption[];
    defaultModel: ModelOption;
  }
> = {
  text: {
    placeholder: "Type your prompt here...",
    models: TEXT_MODELS,
    defaultModel: TEXT_MODELS[3], // Claude Sonnet 4.6
  },
  image: {
    placeholder: "Describe the image...",
    models: IMAGE_MODELS,
    defaultModel: IMAGE_MODELS[1], // Nano Banana Pro
  },
  code: {
    placeholder: "Ask anything to build",
    models: CODE_MODELS,
    defaultModel: CODE_MODELS[2], // Claude Sonnet 4.6
  },
  video: {
    placeholder: "Describe the Video you want to generate...",
    models: VIDEO_MODELS,
    defaultModel: VIDEO_MODELS[0], // Google Veo 3.1
  },
};
