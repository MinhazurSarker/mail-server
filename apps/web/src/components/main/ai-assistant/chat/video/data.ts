import { VideoChatMessage } from "./types";

export const INITIAL_VIDEO_MESSAGES: VideoChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    text: "Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.",
    isEditable: false,
  },
  {
    id: "msg-2",
    sender: "ai",
    description: "I have generated Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.",
    thumbnailSrc: "/images/ai/video-thumb.png",
    videoUrl: "https://www.youtube.com/watch?v=_iHmNaQBtKk",
    alt: "Minimalist building facade",
  },
];
