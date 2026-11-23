"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Product, ProductStatusKey } from "./types";

export interface ProductRowProps {
  product: Product;
  className?: string;
}

const statusColorMap: Record<
  ProductStatusKey,
  "success" | "error" | "warning"
> = {
  inStock: "success",
  lowStock: "error",
  outOfStock: "warning",
};

export default function ProductRow({
  product,
  className = "",
}: ProductRowProps) {
  const t = useTranslations("sales.topProducts");

  return (
    <TableRow
      className={cn(
        "h-16.5 border-b border-gray-100 last:border-b-0 dark:border-gray-800",
        className,
      )}
    >
      <TableCell className="px-5 py-2 text-start whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative size-12.5 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
            <Image
              src={product.image}
              alt={t(`products.${product.nameKey}`)}
              width={50}
              height={50}
              className="size-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {t(`products.${product.nameKey}`)}
            </p>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {t(`variants.${product.variantKey}`)}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-6 py-3 text-start whitespace-nowrap">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {t(`categories.${product.categoryKey}`)}
        </p>
      </TableCell>

      <TableCell className="px-6 py-3 text-start whitespace-nowrap">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {product.sales}
        </p>
      </TableCell>

      <TableCell className="px-6 py-3 text-start whitespace-nowrap">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {product.earnings}
        </p>
      </TableCell>

      <TableCell className="px-6 py-3 text-start whitespace-nowrap">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {product.stocks}
        </p>
      </TableCell>

      <TableCell className="py-3 ps-6 pe-5 text-start whitespace-nowrap">
        <Badge color={statusColorMap[product.status]} size="sm">
          {t(`statuses.${product.status}`)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
