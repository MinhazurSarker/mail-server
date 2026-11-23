"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AngleDownIcon, AngleUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useMemo, useState } from "react";
import { productsData as initialProducts } from "./data";
import ProductListFilter from "./filter";
import ProductListHeader from "./header";
import ProductListPagination from "./pagination";
import ProductRow from "./product-row";
import { Product, SortConfig, SortKey } from "./types";

export interface ProductListProps {
  initialData?: Product[];
  itemsPerPage?: number;
}

export default function ProductList({
  initialData = initialProducts,
  itemsPerPage = 7,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(initialProducts.map((p) => p.category)));
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesStock =
        selectedStock === "all" || product.stock === selectedStock;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedStock]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valA: string | number = a[sortConfig.key];
      let valB: string | number = b[sortConfig.key];

      if (sortConfig.key === "price") {
        valA = parseFloat(String(valA).replace(/[^0-9.]/g, "")) || 0;
        valB = parseFloat(String(valB).replace(/[^0-9.]/g, "")) || 0;
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortConfig]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Sorting handler
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key: SortKey) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === "asc";
    const isDesc = sortConfig.key === key && sortConfig.direction === "desc";

    return (
      <span className="flex flex-col gap-0.5" aria-hidden="true">
        <AngleUpIcon
          className={cn(
            "size-2 transition-colors",
            isAsc
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500",
          )}
        />
        <AngleDownIcon
          className={cn(
            "size-2 transition-colors",
            isDesc
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500",
          )}
        />
      </span>
    );
  };

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id));

  const handleToggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    setSelectedIds((prev) => {
      if (isAllSelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }
      return Array.from(new Set([...prev, ...pageIds]));
    });
  };

  // Row action handlers
  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleDuplicate = (product: Product) => {
    const newId = Math.max(...products.map((p) => p.id), 0) + 1;
    const duplicated: Product = {
      ...product,
      id: newId,
      name: `${product.name} (Copy)`,
    };
    setProducts((prev) => [duplicated, ...prev]);
  };

  const handleExport = () => {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Brand",
      "Price",
      "Stock",
      "CreatedAt",
    ];
    const rows = sortedProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      `"${p.price}"`,
      `"${p.stock}"`,
      `"${p.createdAt}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStock("all");
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header */}
      <ProductListHeader onExport={handleExport} />

      {/* Filter Section */}
      <ProductListFilter
        search={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        selectedStock={selectedStock}
        onStockChange={(val) => {
          setSelectedStock(val);
          setCurrentPage(1);
        }}
        categories={categories}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <ScrollArea className="max-w-full">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="w-14 px-5 py-3 text-start">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleToggleSelectAll}
                  aria-label="Select all products"
                />
              </TableCell>
              <TableCell
                isHeader
                onClick={() => handleSort("name")}
                className="group cursor-pointer px-5 py-3 text-start text-xs font-medium text-gray-500 select-none dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  Products
                  {renderSortIcon("name")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                onClick={() => handleSort("category")}
                className="group cursor-pointer px-5 py-3 text-start text-xs font-medium text-gray-500 select-none dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  Category
                  {renderSortIcon("category")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                onClick={() => handleSort("brand")}
                className="group cursor-pointer px-5 py-3 text-start text-xs font-medium text-gray-500 select-none dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  Brand
                  {renderSortIcon("brand")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                onClick={() => handleSort("price")}
                className="group cursor-pointer px-5 py-3 text-start text-xs font-medium text-gray-500 select-none dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  Price
                  {renderSortIcon("price")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Stock
              </TableCell>
              <TableCell
                isHeader
                onClick={() => handleSort("createdAt")}
                className="group cursor-pointer px-5 py-3 text-start text-xs font-medium text-gray-500 select-none dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  Created
                  {renderSortIcon("createdAt")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="w-14 px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                <span className="sr-only">Action</span>
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.includes(product.id)}
                  onSelect={handleToggleSelect}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <ProductListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
