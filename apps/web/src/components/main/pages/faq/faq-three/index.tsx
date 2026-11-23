"use client";

import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/utils";
import { defaultFaqThreeData } from "./data";
import FaqItem from "./faq-item";
import { FaqThreeProps } from "./types";

export default function FaqThree({
  className,
  items = defaultFaqThreeData,
  defaultOpenIndex = 0,
}: FaqThreeProps) {
  const midpoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midpoint);
  const rightItems = items.slice(midpoint);

  return (
    <Accordion
      defaultValue={
        defaultOpenIndex !== null && defaultOpenIndex !== undefined
          ? [defaultOpenIndex]
          : []
      }
      className={cn(
        "grid grid-cols-1 items-start gap-x-8 xl:grid-cols-2",
        className,
      )}
    >
      <div
        className={cn(
          rightItems.length > 0 &&
            "border-b border-gray-200 xl:border-b-0 dark:border-gray-800",
        )}
      >
        {leftItems.map((item, index) => (
          <FaqItem key={index} item={item} value={index} />
        ))}
      </div>
      <div>
        {rightItems.map((item, index) => (
          <FaqItem
            key={midpoint + index}
            item={item}
            value={midpoint + index}
          />
        ))}
      </div>
    </Accordion>
  );
}

export * from "./data";
export { default as FaqItem } from "./faq-item";
export * from "./types";
