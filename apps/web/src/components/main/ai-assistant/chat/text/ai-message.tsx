import { cn } from "@/utils";
import AiMessageActions from "./ai-message-actions";
import AiMessageHeader from "./ai-message-header";
import { AiMessageProps } from "./types";

export default function AiMessage({
  modelName,
  modelIcon,
  content,
  onRegenerate,
  className,
}: AiMessageProps) {
  const paragraphs = Array.isArray(content) ? content : [content];
  const copyText = paragraphs.join("\n\n");

  return (
    <div className={cn("flex justify-start", className)}>
      <div>
        <div className="max-w-120">
          <AiMessageHeader name={modelName} icon={modelIcon} />
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="mb-2 text-base leading-6 text-pretty wrap-break-word text-gray-800 dark:text-white/90"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <AiMessageActions
          contentToCopy={copyText}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}
