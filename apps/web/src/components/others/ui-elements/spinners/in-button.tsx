import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SpinnerInButton() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button>
        <Spinner />
        Loading...
      </Button>

      <Button variant="outline">
        <Spinner className="text-brand-500" />
        Loading...
      </Button>
    </div>
  );
}
