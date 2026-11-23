import { GeminiIcon, GptIcon, XAiIcon } from "@/icons";
import { TokenStatItem } from "./types";

export const statsData: TokenStatItem[] = [
  {
    id: "gpt",
    name: "GPT",
    keyCount: 2,
    usage: "7M",
    dotColor: "bg-brand-400",
    icon: GptIcon,
  },
  {
    id: "gemini",
    name: "Gemini",
    keyCount: 1,
    usage: "2M",
    dotColor: "bg-purple-300",
    icon: GeminiIcon,
  },
  {
    id: "x-ai",
    name: "xAI",
    keyCount: 2,
    usage: "4.5M",
    dotColor: "bg-sky-300",
    icon: XAiIcon,
    iconClassName: "text-gray-800 dark:text-white/90",
  },
];
