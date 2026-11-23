import GridShape from "@/components/common/grid-shape";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";
import * as React from "react";
import CountdownTimer from "./countdown-timer";
import SocialLinks from "./social-links";
import SubscribeForm from "./subscribe-form";
import { ComingSoonProps } from "./types";

export default function ComingSoon({
  targetDate,
  title = "Coming Soon",
  description = "Our website is currently under construction, enter your email id to get latest updates and notifications about the website.",
  subscribeText = "Don’t want to miss update? Subscribe now",
  className,
  onSubscribe,
}: ComingSoonProps) {
  const resolvedTargetDate = React.useMemo(() => {
    if (targetDate) return targetDate;
    const date = new Date();
    date.setDate(date.getDate() + 29);
    return date;
  }, [targetDate]);

  return (
    <div
      className={cn(
        "relative z-1 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6",
        className,
      )}
    >
      <GridShape />

      <div>
        <div className="mx-auto w-full max-w-115 text-center">
          <Link href="/" className="mb-6 inline-block">
            <Image
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
              width={154}
              height={32}
              priority
            />
            <Image
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
              width={154}
              height={32}
              priority
            />
          </Link>

          <h1 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {title}
          </h1>

          <p className="mb-9 text-base text-gray-500 dark:text-gray-400">
            {description}
          </p>

          <CountdownTimer targetDate={resolvedTargetDate} />

          <p className="mb-5 text-sm text-gray-700 dark:text-gray-400">
            {subscribeText}
          </p>

          <SubscribeForm onSubscribe={onSubscribe} />
        </div>

        <SocialLinks />
      </div>
    </div>
  );
}

export { default as SocialLinks } from "./social-links";
export { default as SubscribeForm } from "./subscribe-form";
export * from "./types";
