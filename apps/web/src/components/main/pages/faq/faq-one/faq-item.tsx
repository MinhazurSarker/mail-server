"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDownIcon } from "@/icons";
import { FaqItemProps } from "./types";

export default function FaqItem({ item, value }: FaqItemProps) {
  const { title, content } = item;

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all last:border-b dark:border-gray-800 dark:bg-white/3"
    >
      <AccordionTrigger
        showIcon={false}
        className="flex w-full cursor-pointer items-center justify-between py-3 ps-6 pe-3 text-start transition-colors no-underline hover:no-underline focus:outline-hidden aria-expanded:bg-gray-50 dark:aria-expanded:bg-white/3"
      >
        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-200 ease-linear group-aria-expanded/accordion-trigger:rotate-180 group-aria-expanded/accordion-trigger:text-gray-800 dark:bg-white/3 dark:text-gray-400 dark:group-aria-expanded/accordion-trigger:text-white/90">
          <ChevronDownIcon className="size-5" />
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-6 py-7">
        <p className="text-base text-gray-500 dark:text-gray-400">
          {content}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

