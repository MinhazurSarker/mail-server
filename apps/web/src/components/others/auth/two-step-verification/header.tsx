import { cn } from "@/utils";

export interface TwoStepVerificationHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function TwoStepVerificationHeader({
  title = "Two Step Verification",
  description = "A verification code has been sent to your mobile. Please enter it in the field below.",
  className,
}: TwoStepVerificationHeaderProps) {
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

export { TwoStepVerificationHeader as OtpHeader };
