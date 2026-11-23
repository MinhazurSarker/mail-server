import { LoaderFourIcon } from "./icons";
import { cn } from "@/utils";

function SpinnerFour({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderFourIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export default function SpinnerFourExample() {
  return (
    <div className="flex items-center justify-center gap-4 sm:justify-normal">
      <SpinnerFour className="size-5 text-brand-500" />
      <SpinnerFour className="size-7 text-brand-500" />
      <SpinnerFour className="size-9 text-brand-500" />
      <SpinnerFour className="size-10 text-brand-500" />
      <SpinnerFour className="size-12 text-brand-500" />
    </div>
  );
}

export { SpinnerFour };
