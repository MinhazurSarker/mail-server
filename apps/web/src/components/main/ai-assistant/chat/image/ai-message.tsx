import { cn } from "@/utils";
import AiMessageHeader from "./ai-message-header";
import ImageCard from "./image-card";
import { AiMessageProps } from "./types";

export default function AiMessage({
  modelName,
  modelIcon,
  description,
  imageSrc,
  imageAlt,
  onEdit,
  onRegenerate,
  onCopy,
  onDownload,
  className,
}: AiMessageProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div>
        <div className="max-w-120">
          <AiMessageHeader name={modelName} icon={modelIcon} />
          {description && (
            <p className="mb-2 text-base leading-6 wrap-break-word text-gray-800 dark:text-white/90">
              {description}
            </p>
          )}
          <ImageCard
            src={imageSrc}
            alt={imageAlt}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onCopy={onCopy}
            onDownload={onDownload}
          />
        </div>
      </div>
    </div>
  );
}
