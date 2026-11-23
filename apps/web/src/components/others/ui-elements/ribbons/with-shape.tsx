import { Badge } from "@/components/ui/badge";

export default function RibbonWithShape() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/3">
      <Badge className="absolute -inset-s-px top-3 inline-flex h-8 items-center rounded-none bg-brand-500 ps-4 pe-2 text-sm font-medium text-white shadow-none [text-shadow:none] before:absolute before:-inset-e-6.5 before:top-0 before:border-16 before:border-transparent before:border-s-brand-500 before:border-t-brand-500 before:content-[''] after:absolute after:-inset-e-6.5 after:bottom-0 after:border-16 after:border-transparent after:border-s-brand-500 after:border-b-brand-500 after:content-['']">
        Popular
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
