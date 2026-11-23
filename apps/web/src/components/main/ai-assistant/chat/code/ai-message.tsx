import { cn } from "@/utils";
import AiMessageHeader from "./ai-message-header";
import CodeBlock from "./code-block";
import { AiMessageProps } from "./types";

export default function AiMessage({
  modelName,
  modelIcon,
  description,
  code,
  language,
  showLineNumbers,
  footerNote,
  className,
}: AiMessageProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div className="w-full">
        <div className="max-w-[480px] mb-3">
          <AiMessageHeader name={modelName} icon={modelIcon} />
          {description && (
            <p className="mb-3 text-base leading-6 text-gray-800 dark:text-white/90">
              {description}
            </p>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-white/3 border dark:border-gray-800 border-gray-200 dark:bg-dark-primary shadow-theme-xs rounded-[20px] w-full lg:max-w-3xl relative">
            <CodeBlock
              code={code}
              language={language}
              showLineNumbers={showLineNumbers}
            />
          </div>
          {footerNote && (
            <div className="mt-4">
              <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                {footerNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
