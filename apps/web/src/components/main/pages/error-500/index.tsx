import GridShape from "@/components/common/grid-shape";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";
import { Error500Props } from "./types";

export default function Error500({
  title = "ERROR",
  description = "We can’t seem to find the page you are looking for!",
  homeLinkText = "Back to Home Page",
  homeHref = "/",
  className,
}: Error500Props) {
  return (
    <div
      className={cn(
        "relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6",
        className,
      )}
    >
      <GridShape />

      <div className="mx-auto w-full max-w-60.5 text-center sm:max-w-140.5">
        <h1 className="mb-8 text-2xl font-bold text-gray-800 xl:text-[64px] dark:text-white/90">
          {title}
        </h1>

        <Image
          src="/images/error/500.svg"
          alt="500"
          className="dark:hidden"
          width={560}
          height={154}
          priority
        />
        <Image
          src="/images/error/500-dark.svg"
          alt="500"
          className="hidden dark:block"
          width={560}
          height={154}
          priority
        />

        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
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
