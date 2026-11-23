"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { TableCell, TableRow } from "@/components/ui/table";
import { HorizontalDotsIcon } from "@/icons";
import Image from "next/image";
import { Product } from "./types";

export interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export default function ProductRow({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductRowProps) {
  return (
    <TableRow className="transition hover:bg-gray-50/50 dark:hover:bg-white/2">
      <TableCell className="w-14 px-5 py-4 whitespace-nowrap">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(product.id)}
          aria-label={`Select ${product.name}`}
        />
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <Image
              width={48}
              height={48}
              src={product.image}
              alt={product.name}
              className="size-12 rounded-lg object-cover"
            />
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {product.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {product.category}
      </TableCell>
      <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {product.brand}
      </TableCell>
      <TableCell className="px-5 py-4 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
        {product.price}
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <Badge
          size="sm"
          color={product.stock === "In Stock" ? "success" : "error"}
        >
          {product.stock}
        </Badge>
      </TableCell>
      <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {product.createdAt}
      </TableCell>
      <TableCell className="w-14 px-5 py-4 text-end whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Product actions"
              />
            }
          >
            <HorizontalDotsIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(product)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(product)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete?.(product.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
