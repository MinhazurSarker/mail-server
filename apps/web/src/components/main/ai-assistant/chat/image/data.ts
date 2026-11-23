import { ImageChatMessage } from "./types";

export const INITIAL_IMAGE_MESSAGES: ImageChatMessage[] = [
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
    imageSrc: "/images/ai/img-1.png",
    imageAlt: "Minimalist building facade",
  },
];
