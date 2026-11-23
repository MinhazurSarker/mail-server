"use client";

import { Button } from "@/components/ui/button";
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
import { InfoIcon, MinusIcon, PlusIcon } from "@/icons";
import { useState } from "react";
import { InvoiceItem } from "../types";

const discountOptions = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "10", label: "10%" },
  { value: "15", label: "15%" },
  { value: "20", label: "20%" },
  { value: "50", label: "50%" },
];

interface AddProductFormProps {
  onAddItem: (item: Omit<InvoiceItem, "id" | "total">) => void;
}

export default function AddProductForm({ onAddItem }: AddProductFormProps) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState("0");

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim() || !price) return;

    const unitCost = parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
    const discountVal = parseFloat(discount) || 0;

    onAddItem({
      name: productName.trim(),
      quantity: quantity,
      unitCost: unitCost,
      discount: discountVal,
    });

    setProductName("");
    setPrice("");
    setQuantity(1);
    setDiscount("0");
  };

  return (
    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/40">
      <form onSubmit={handleSaveProduct} className="space-y-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Product Name */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Field>
              <FieldLabel htmlFor="add-product-name">Product Name</FieldLabel>
              <Input
                id="add-product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </Field>
          </div>

          {/* Price */}
          <div className="sm:col-span-1 lg:col-span-3 xl:col-span-2">
            <Field>
              <FieldLabel htmlFor="add-product-price">Price</FieldLabel>
              <Input
                id="add-product-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter product price"
              />
            </Field>
          </div>

          {/* Quantity */}
          <div className="sm:col-span-1 lg:col-span-2">
            <Field>
              <FieldLabel htmlFor="add-product-quantity">Quantity</FieldLabel>
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
                  id="add-product-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
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
          </div>

          {/* Discount */}
          <div className="sm:col-span-1 lg:col-span-2">
            <Field>
              <FieldLabel>Discount</FieldLabel>
              <Select
                value={discount}
                onValueChange={(val) => setDiscount(val || "0")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="0%" />
                </SelectTrigger>
                <SelectContent>
                  {discountOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Save Product Button */}
          <div className="flex items-end sm:col-span-1 lg:col-span-2">
            <Button
              type="submit"
              variant="default"
              className="h-11 w-full px-3 sm:px-4"
              disabled={!productName.trim() || !price}
            >
              Save Product
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 text-gray-500 dark:text-gray-400">
          <InfoIcon className="size-5 shrink-0 text-gray-400 dark:text-gray-500" />
          <p className="text-sm">
            After filling in the product details, press Enter/Return or click &apos;Save Product&apos; to add it to the list.
          </p>
        </div>
      </form>
    </div>
  );
}
