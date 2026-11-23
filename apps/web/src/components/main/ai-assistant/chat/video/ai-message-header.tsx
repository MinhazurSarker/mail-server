import { GoogleIcon } from "@/icons";
import { cn } from "@/utils";
import { AiMessageHeaderProps } from "./types";

export default function AiMessageHeader({
  name = "Google Veo 3.1",
  icon = <GoogleIcon className="size-4.5" />,
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
