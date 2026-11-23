"use client";

import UserMessage from "../text/user-message";
import AiMessage from "./ai-message";
import { INITIAL_CODE_MESSAGES } from "./data";

export default function CodeGeneratorContent() {
  return (
    <div className="relative z-20 w-full space-y-7 pb-6">
      {INITIAL_CODE_MESSAGES.map((msg) =>
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
            code={msg.code ?? ""}
            language={msg.language ?? "text"}
            showLineNumbers={msg.showLineNumbers}
            footerNote={msg.footerNote}
          />
        ),
      )}
    </div>
  );
}
