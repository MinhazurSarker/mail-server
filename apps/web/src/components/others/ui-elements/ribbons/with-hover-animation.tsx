import { Badge } from "@/components/ui/badge";
import { BoltIcon } from "@/icons";

export default function RibbonWithHoverAnimation() {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/3">
      <Badge className="absolute -inset-s-px top-3 inline-flex h-8 -translate-x-17 items-center gap-1.5 rounded-none bg-brand-500 ps-4 pe-2 text-sm font-medium text-white shadow-none transition-transform duration-300 ease-in-out [text-shadow:none] group-hover:translate-x-0 before:absolute before:-inset-e-5.5 before:top-0 before:border-16 before:border-transparent before:border-s-brand-500 before:border-t-brand-500 before:content-[''] after:absolute after:-inset-e-5.5 after:bottom-0 after:border-16 after:border-transparent after:border-s-brand-500 after:border-b-brand-500 after:content-[''] rtl:translate-x-17 rtl:group-hover:translate-x-0">
        <span className="opacity-0 transition-opacity duration-300 ease-linear group-hover:opacity-100">
          Trending
        </span>
        <BoltIcon className="size-4" />
      </Badge>
      <div className="p-5 pt-16">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lorem ipsum dolor sit amet consectetur. Eget nulla suscipit arcu
          rutrum amet vel nec fringilla vulputate. Sed aliquam fringilla
          vulputate imperdiet arcu natoque purus ac nec ultricies nulla
          ultrices.
        </p>
      </div>
    </div>
  );
}
