import GridShape from "@/components/common/grid-shape";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";
import { SuccessProps } from "./types";

export default function Success({
  title = "SUCCESS !",
  description = "Awesome! your message has been sent successfully, Our support team will get back to you as soon as possible.",
  homeLinkText = "Back to Home Page",
  homeHref = "/",
  className,
}: SuccessProps) {
  return (
    <div
      className={cn(
        "relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6",
        className,
      )}
    >
      <GridShape />
      <div className="mx-auto w-full max-w-68.5 text-center sm:max-w-138.75">
        <div className="mx-auto mb-10 w-full max-w-25 text-center sm:max-w-40">
          <Image
            src="/images/error/success.svg"
            alt="success"
            className="dark:hidden"
            width={148}
            height={148}
            priority
          />
          <Image
            src="/images/error/success-dark.svg"
            alt="success"
            className="hidden dark:block"
            width={148}
            height={148}
            priority
          />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-800 xl:text-[64px] dark:text-white/90">
          {title}
        </h1>

        <p className="mt-6 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          {description}
        </p>

        <Button
          size="lg"
          variant="outline"
          className="h-12.5 bg-white"
          nativeButton={false}
          render={<Link href={homeHref} />}
        >
          {homeLinkText}
        </Button>
      </div>

      <p className="absolute inset-s-1/2 bottom-6 -translate-x-1/2 text-center text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - TailAdmin
      </p>
    </div>
  );
}
