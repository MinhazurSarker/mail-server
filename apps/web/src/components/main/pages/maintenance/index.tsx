import GridShape from "@/components/common/grid-shape";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";
import { MaintenanceProps } from "./types";

export default function Maintenance({
  title = "MAINTENANCE",
  description = "Our Site is Currently under maintenance We will be back Shortly Thank You For Patience",
  homeLinkText = "Back to Home Page",
  homeHref = "/",
  className,
}: MaintenanceProps) {
  return (
    <div
      className={cn(
        "relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6",
        className,
      )}
    >
      <GridShape />

      <div>
        <div className="mx-auto w-full max-w-68.5 text-center sm:max-w-138.75">
          <div className="mx-auto mb-10 w-full max-w-38.75 text-center sm:max-w-51">
            <Image
              src="/images/error/maintenance.svg"
              alt="maintenance"
              className="dark:hidden"
              width={205}
              height={205}
              priority
            />
            <Image
              src="/images/error/maintenance-dark.svg"
              alt="maintenance"
              className="hidden dark:block"
              width={205}
              height={205}
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
    </div>
  );
}

export * from "./types";
