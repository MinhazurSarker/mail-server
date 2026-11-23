import { Badge } from "@/components/ui/badge";

export default function FilledRibbon() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/3">
      <Badge className="absolute -inset-s-9 -top-7 mt-3 flex h-14 w-24 -rotate-45 items-end justify-center bg-brand-500 pb-1.5 text-sm font-medium text-white shadow-theme-xs [text-shadow:none] rtl:rotate-45">
        New
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
