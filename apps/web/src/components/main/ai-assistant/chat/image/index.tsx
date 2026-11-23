"use client";

import UserMessage from "../text/user-message";
import AiMessage from "./ai-message";
import { INITIAL_IMAGE_MESSAGES } from "./data";

export default function ImageGeneratorContent() {
  return (
    <div className="relative z-20 w-full space-y-7 pb-6">
      {INITIAL_IMAGE_MESSAGES.map((msg) =>
        msg.sender === "user" ? (
          <UserMessage
            key={msg.id}
            initialText={msg.text ?? ""}
            isEditable={msg.isEditable}
          />
        ) : (
          <AiMessage
            key={msg.id}
            description={msg.description}
            imageSrc={msg.imageSrc ?? ""}
            imageAlt={msg.imageAlt}
          />
        ),
      )}
    </div>
  );
}
