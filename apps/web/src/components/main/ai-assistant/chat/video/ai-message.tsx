import { cn } from "@/utils";
import AiMessageHeader from "./ai-message-header";
import { AiMessageProps } from "./types";
import VideoCard from "./video-card";

export default function AiMessage({
  modelName,
  modelIcon,
  description,
  thumbnailSrc,
  videoUrl,
  alt,
  onRegenerate,
  onDownload,
  className,
}: AiMessageProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div>
        <div className="max-w-[480px]">
          <AiMessageHeader name={modelName} icon={modelIcon} />
          {description && (
            <p className="mb-2 text-base leading-6 text-gray-800 dark:text-white/90">
              {description}
            </p>
          )}
          <VideoCard
            thumbnailSrc={thumbnailSrc}
            videoUrl={videoUrl}
            alt={alt}
            onRegenerate={onRegenerate}
            onDownload={onDownload}
          />
        </div>
      </div>
    </div>
  );
}
