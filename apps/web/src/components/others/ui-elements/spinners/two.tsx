import { LoaderTwoIcon } from "./icons";
import { cn } from "@/utils";

function SpinnerTwo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderTwoIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export default function SpinnerTwoExample() {
  return (
    <div className="flex items-center justify-center gap-4 sm:justify-normal">
      <SpinnerTwo className="size-5" />
      <SpinnerTwo className="size-7" />
      <SpinnerTwo className="size-9" />
      <SpinnerTwo className="size-10" />
      <SpinnerTwo className="size-12" />
    </div>
  );
}

export { SpinnerTwo };
