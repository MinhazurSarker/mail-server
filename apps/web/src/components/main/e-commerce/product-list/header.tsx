"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DownloadIcon, PlusIcon } from "@/icons";

export interface ProductListHeaderProps {
  title?: string;
  subtitle?: string;
  onExport?: () => void;
  addProductHref?: string;
}

export default function ProductListHeader({
  title = "Products List",
  subtitle = "Track your store's progress to boost your sales.",
  onExport,
  addProductHref = "/add-product",
}: ProductListHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onExport}>
          <span>Export</span>
          <DownloadIcon className="size-5" />
        </Button>

        <Button
          nativeButton={false}
          render={
            <Link href="/add-product">
              <PlusIcon className="size-5" />
              <span>Add Product</span>
            </Link>
          }
        />
      </div>
    </div>
  );
}
