import { cn } from "@/utils";

export interface ResetPasswordHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function ResetPasswordHeader({
  title = "Forgot Your Password?",
  description = "Enter the email address linked to your account, and we’ll send you a link to reset your password.",
  className,
}: ResetPasswordHeaderProps) {
  return (
    <div className={cn("mb-5 sm:mb-8", className)}>
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
        {title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
