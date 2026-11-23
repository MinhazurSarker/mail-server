"use client";

import AiMessage from "./ai-message";
import { INITIAL_TEXT_MESSAGES } from "./data";
import UserMessage from "./user-message";

export default function TextGeneratorContent() {
  return (
    <div className="relative z-20 w-full space-y-7 pb-6">
      {INITIAL_TEXT_MESSAGES.map((msg) =>
        msg.sender === "user" ? (
          <UserMessage
            key={msg.id}
            initialText={msg.text ?? ""}
            isEditable={msg.isEditable}
          />
        ) : (
          <AiMessage key={msg.id} content={msg.paragraphs ?? []} />
        ),
      )}
    </div>
  );
}
