"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Recipient } from "./types";

interface RecipientListProps {
  recipients: Recipient[];
  selectedId: number;
  onSelectRecipient: (id: number) => void;
  className?: string;
}

export default function RecipientList({
  recipients,
  selectedId,
  onSelectRecipient,
  className,
}: RecipientListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const isRtl = document.documentElement.dir === "rtl";
      if (isRtl) {
        const maxScroll = scrollWidth - clientWidth;
        const currentScroll = Math.abs(scrollLeft);
        setCanScrollPrev(currentScroll > 5);
        setCanScrollNext(currentScroll < maxScroll - 5);
      } else {
        setCanScrollPrev(scrollLeft > 5);
        setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 5);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [recipients]);

  const scrollPrev = () => {
    if (scrollRef.current) {
      const isRtl = document.documentElement.dir === "rtl";
      scrollRef.current.scrollBy({
        left: isRtl ? 120 : -120,
        behavior: "smooth",
      });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      const isRtl = document.documentElement.dir === "rtl";
      scrollRef.current.scrollBy({
        left: isRtl ? -120 : 120,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous recipients"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <ChevronLeftIcon className="size-4 rtl:rotate-180" />
      </button>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1 sm:gap-2.5"
      >
        {recipients.map((recipient) => {
          const isSelected = selectedId === recipient.id;
          return (
            <button
              key={recipient.id}
              type="button"
              onClick={() => onSelectRecipient(recipient.id)}
              aria-label={recipient.name || `User ${recipient.id}`}
              className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full p-0.75 transition-all",
                isSelected
                  ? "border border-brand-500"
                  : "border border-transparent hover:border-gray-300 dark:hover:border-gray-700",
              )}
            >
              <Image
                src={recipient.avatar}
                alt={recipient.name || `User ${recipient.id}`}
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next recipients"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <ChevronRightIcon className="size-4 rtl:rotate-180" />
      </button>
    </div>
  );
}
