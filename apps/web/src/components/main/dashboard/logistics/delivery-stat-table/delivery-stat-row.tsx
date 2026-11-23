"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { DeliveryActivity } from "./types";

interface DeliveryStatRowProps {
  delivery: DeliveryActivity;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function DeliveryStatRow({
  delivery,
  isSelected,
  onToggleSelect,
}: DeliveryStatRowProps) {
  const t = useTranslations("logistics.deliveriesActivity");

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "furniture":
        return t("categories.furniture");
      case "clothing":
        return t("categories.clothing");
      case "books":
        return t("categories.books");
      case "automotive":
        return t("categories.automotive");
      case "electronics":
        return t("categories.electronics");
      case "health":
        return t("categories.health");
      case "toys":
        return t("categories.toys");
      case "kitchen":
        return t("categories.kitchen");
      case "beauty":
        return t("categories.beauty");
      case "sports":
        return t("categories.sports");
      default:
        return category;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return t("statuses.delivered");
      case "in-transit":
        return t("statuses.inTransit");
      case "canceled":
        return t("statuses.canceled");
      case "pending":
        return t("statuses.pending");
      case "processing":
        return t("statuses.processing");
      default:
        return status;
    }
  };

  const getStatusColor = (
    status: string,
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "delivered":
        return "success";
      case "in-transit":
        return "warning";
      case "canceled":
        return "error";
      case "pending":
        return "warning";
      case "processing":
        return "info";
      default:
        return "success";
    }
  };

  return (
    <TableRow className="h-15 transition hover:bg-gray-50/80 dark:hover:bg-white/3">
      {/* Checkbox + Order ID */}
      <TableCell className="min-w-40 py-3 ps-5 sm:ps-6">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(delivery.id)}
            aria-label={`Select order ${delivery.id}`}
          />
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {delivery.id}
          </span>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell className="min-w-36 px-4 py-3 text-sm font-normal whitespace-nowrap text-gray-800 dark:text-white/90">
        {getCategoryLabel(delivery.category)}
      </TableCell>

      {/* Company */}
      <TableCell className="min-w-40 px-4 py-3 text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {delivery.company}
      </TableCell>

      {/* Arrival Time */}
      <TableCell className="min-w-48 px-4 py-3 text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {delivery.arrival}
      </TableCell>

      {/* Route */}
      <TableCell className="min-w-48 px-4 py-3 text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {delivery.route}
      </TableCell>

      {/* Price */}
      <TableCell className="min-w-32 px-4 py-3 text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {delivery.price}
      </TableCell>

      {/* Status Badge */}
      <TableCell className="min-w-32 py-3 pe-5 sm:pe-6">
        <Badge size="sm" color={getStatusColor(delivery.status)}>
          {getStatusLabel(delivery.status)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
