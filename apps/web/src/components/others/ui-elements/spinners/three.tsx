import { LoaderThreeIcon } from "./icons";
import { cn } from "@/utils";

function SpinnerThree({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderThreeIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export default function SpinnerThreeExample() {
  return (
    <div className="flex items-center justify-center gap-4 sm:justify-normal">
      <SpinnerThree className="size-5" />
      <SpinnerThree className="size-7" />
      <SpinnerThree className="size-9" />
      <SpinnerThree className="size-10" />
      <SpinnerThree className="size-12" />
    </div>
  );
}

export { SpinnerThree };
