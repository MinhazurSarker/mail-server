"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinusIcon, PlusIcon } from "@/icons";
import { useState } from "react";

export default function PriceAvailability() {
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  const handleDecrement = () => {
    setStockQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleIncrement = () => {
    setStockQuantity((prev) => prev + 1);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h2 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          Pricing & Availability
        </h2>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Row 1: Price, Discount, Selling Price */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="product-price">Price</FieldLabel>
            <Input id="product-price" placeholder="0.00" />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-discount">Discount</FieldLabel>
            <Input id="product-discount" placeholder="0%" />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-selling-price">
              Selling Price
            </FieldLabel>
            <Input id="product-selling-price" placeholder="0.00" readOnly />
          </Field>
        </div>

        {/* Row 2: Stock Quantity & Availability Status */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-stock-quantity">
              Stock Quantity
            </FieldLabel>
            <InputGroup className="h-11 overflow-hidden">
              <InputGroupAddon
                align="inline-start"
                className="h-full border-e border-gray-300 p-0 dark:border-gray-700"
              >
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="size-11 rounded-none text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <MinusIcon className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>

              <InputGroupInput
                id="product-stock-quantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="[appearance:textfield] text-center font-medium text-gray-800 dark:text-white [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              />

              <InputGroupAddon
                align="inline-end"
                className="h-full border-s border-gray-300 p-0 dark:border-gray-700"
              >
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="size-11 rounded-none text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <PlusIcon className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel>Availability Status</FieldLabel>
            <Select defaultValue="In Stock">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </div>
  );
}
