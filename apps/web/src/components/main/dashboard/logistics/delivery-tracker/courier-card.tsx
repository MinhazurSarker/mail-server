"use client";

import { Button } from "@/components/ui/button";
import { CallIcon, ChatIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { CourierCardProps } from "./types";

export default function CourierCard({ courier, className }: CourierCardProps) {
  const t = useTranslations("logistics.deliveryMan");

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl bg-white p-3 sm:px-3.5 sm:py-3 dark:bg-gray-900",
        className,
      )}
    >
      {/* Courier details */}
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={courier.avatar}
            alt={courier.name}
            width={48}
            height={48}
            className="size-full object-cover"
          />
        </div>

        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t(courier.roleKey)}
          </span>
          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
            {courier.name}
          </h5>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={courier.onChat}
          aria-label={`Chat with ${courier.name}`}
          className="rounded-full"
        >
          <ChatIcon />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={courier.onCall}
          aria-label={`Call ${courier.name}`}
          className="rounded-full"
        >
          <CallIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
