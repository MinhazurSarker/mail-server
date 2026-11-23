import { ClaudeIcon } from "@/icons";
import { cn } from "@/utils";
import { AiMessageHeaderProps } from "./types";

export default function AiMessageHeader({
  name = "Claude Sonnet 4.6",
  icon = <ClaudeIcon className="size-4.5" />,
  className,
}: AiMessageHeaderProps) {
  return (
    <p
      className={cn(
        "mb-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400",
        className,
      )}
    >
      {icon}
      {name}
    </p>
  );
}
