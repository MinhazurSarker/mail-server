"use client";

import { VerticalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import type { TrackingMapProps } from "./types";

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1333.6584656966136!2d-4.6945960082501195!3d54.220715631170634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4863930029caaac3%3A0xec55feecc664402b!2sWest%20View%20Park!5e1!3m2!1sen!2sbd!4v1793599797008!5m2!1sen!2sbd";

export default function TrackingMap({
  title,
  subtitle,
  mapUrl = DEFAULT_MAP_URL,
  className,
  onOptionsClick,
}: TrackingMapProps) {
  const t = useTranslations("logistics.trackingDelivery");

  return (
    <div className={cn("rounded-xl bg-white p-4 dark:bg-gray-900", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {title ?? t("title")}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {subtitle ?? t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={onOptionsClick}
          aria-label="Delivery map options"
          className="text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <VerticalDotsIcon className="size-5" />
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <iframe
          src={mapUrl}
          height="180"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full grayscale dark:border-gray-800"
          title="Delivery Tracking Map"
        />
      </div>
    </div>
  );
}
