"use client";

import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/utils";
import * as React from "react";
import { defaultFaqTwoData } from "./data";
import FaqItem from "./faq-item";
import { FaqTwoProps } from "./types";

export default function FaqTwo({
  className,
  items = defaultFaqTwoData,
  defaultOpenIndex = null,
}: FaqTwoProps) {
  return (
    <Accordion
      defaultValue={
        defaultOpenIndex !== null && defaultOpenIndex !== undefined
          ? [defaultOpenIndex]
          : []
      }
      className={cn("space-y-4", className)}
    >
      {items.map((item, index) => (
        <FaqItem key={index} item={item} value={index} />
      ))}
    </Accordion>
  );
}

export * from "./data";
export { default as FaqItem } from "./faq-item";
export * from "./types";

