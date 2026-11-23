import { TextChatMessage } from "./types";

export const INITIAL_TEXT_MESSAGES: TextChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    text: "Can you generate some random, creative, and engaging placeholder text for me? It doesn't need to follow any specific structure—just something fun or interesting to fill space temporarily.",
    isEditable: true,
  },
  {
    id: "msg-2",
    sender: "ai",
    paragraphs: [
      "Marcus pioneers cutting-edge tech ventures, blending AI with bold ideas to reshape the future. He’s driven by a mission to make innovation accessible, sparking change that touches lives worldwide.",
    ],
  },
  {
    id: "msg-3",
    sender: "user",
    text: "I'm looking for a block of random, imaginative text—something quirky or unexpected to use as placeholder content.",
    isEditable: false,
  },
  {
    id: "msg-4",
    sender: "ai",
    paragraphs: [
      "Evelyn ignites passion for green living, leading vibrant community projects that nurture sustainable habits. Her belief in the power of many small acts fuels a brighter, cleaner urban tomorrow.",
    ],
  },
];
