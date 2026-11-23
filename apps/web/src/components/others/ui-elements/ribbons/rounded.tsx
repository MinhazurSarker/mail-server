import { Badge } from "@/components/ui/badge";

export default function RoundedRibbon() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/3">
      <Badge className="absolute -inset-s-px top-3 inline-flex h-8 items-center rounded-s-none rounded-e-full bg-brand-500 px-4 text-sm font-medium text-white shadow-none [text-shadow:none]">
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
