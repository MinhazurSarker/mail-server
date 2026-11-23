"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MinusIcon, PlusIcon } from "@/icons";
import { FaqTwoItemProps } from "./types";

export default function FaqItem({ item, value }: FaqTwoItemProps) {
  const { title, content } = item;

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-xl border-none transition-all data-open:bg-brand-50 dark:data-open:bg-brand-500/10"
    >
      <AccordionTrigger
        showIcon={false}
        className="flex w-full cursor-pointer items-center justify-between bg-gray-100 px-6 py-4 text-start transition-colors no-underline hover:no-underline focus:outline-hidden aria-expanded:bg-brand-50 dark:bg-white/3 dark:aria-expanded:bg-brand-500/15"
      >
        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>

        <span className="flex size-7 shrink-0 items-center justify-center text-gray-500 transition-colors group-aria-expanded/accordion-trigger:text-gray-800 dark:text-gray-400 dark:group-aria-expanded/accordion-trigger:text-white/90">
          <PlusIcon className="size-5 group-aria-expanded/accordion-trigger:hidden" />
          <MinusIcon className="hidden size-5 group-aria-expanded/accordion-trigger:inline" />
        </span>
      </AccordionTrigger>

      <AccordionContent className="border-t border-brand-100 p-6 dark:border-brand-500/20">
        <p className="text-base text-gray-700 dark:text-gray-300">
          {content}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

