"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoxIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import { topProductsData } from "./data";
import ProductRow from "./product-row";
import { Product } from "./types";

export interface TopProductsTableProps {
  data?: Product[];
  className?: string;
  onSeeAll?: () => void;
}

export default function TopProductsTable({
  data = topProductsData,
  className = "",
  onSeeAll,
}: TopProductsTableProps) {
  const t = useTranslations("sales.topProducts");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;
    return data.filter((item) => {
      const productName = t(`products.${item.nameKey}`).toLowerCase();
      const categoryName = t(`categories.${item.categoryKey}`).toLowerCase();
      return productName.includes(query) || categoryName.includes(query);
    });
  }, [data, searchQuery, t]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSeeAllClick={onSeeAll}
      />

      <div className="px-5 pb-5">
        <ScrollArea className="max-w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow className="h-11">
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.productName")}
                  </p>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.productId")}
                  </p>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.sales")}
                  </p>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.earnings")}
                  </p>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.stocks")}
                  </p>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 ps-6 pe-5 text-start whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("table.status")}
                  </p>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredData.length > 0 ? (
                filteredData.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <BoxIcon className="size-6 text-gray-800 dark:text-white/90" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {t("noProducts")}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("noProductsDescription")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
