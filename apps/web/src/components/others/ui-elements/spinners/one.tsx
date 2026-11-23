import { Spinner } from "@/components/ui/spinner";

export default function SpinnerOne() {
  return (
    <div className="flex items-center justify-center gap-4 sm:justify-normal">
      <Spinner className="size-5 text-brand-500" />
      <Spinner className="size-7 text-brand-500" />
      <Spinner className="size-9 text-brand-500" />
      <Spinner className="size-10 text-brand-500" />
      <Spinner className="size-12 text-brand-500" />
    </div>
  );
}

