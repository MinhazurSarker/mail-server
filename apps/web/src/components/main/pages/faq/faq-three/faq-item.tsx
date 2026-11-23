"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoCircleIcon } from "@/icons";
import { FaqItemProps } from "./types";

export default function FaqItem({ item, value }: FaqItemProps) {
  const { title, content } = item;

  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="gap-4 py-4 text-start">
        <div className="flex items-center gap-4 text-start">
          <div className="shrink-0 text-gray-700 dark:text-gray-500">
            <InfoCircleIcon className="size-6" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
            {title}
          </h4>
        </div>
      </AccordionTrigger>

      <AccordionContent className="ps-10 pt-1 pb-4">
        {typeof content === "string" ? (
          <p className="text-base whitespace-pre-line text-gray-500 dark:text-gray-400">
            {content}
          </p>
        ) : (
          content
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
