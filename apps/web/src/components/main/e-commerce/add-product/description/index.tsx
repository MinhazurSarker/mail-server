"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  { value: "Laptop", label: "Laptop" },
  { value: "Phone", label: "Phone" },
  { value: "Watch", label: "Watch" },
  { value: "Electronics", label: "Electronics" },
  { value: "Accessories", label: "Accessories" },
];

const brands = [
  { value: "Apple", label: "Apple" },
  { value: "Samsung", label: "Samsung" },
  { value: "LG", label: "LG" },
  { value: "Sony", label: "Sony" },
];

const colors = [
  { value: "Silver", label: "Silver" },
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Gray", label: "Gray" },
];

export default function ProductDescription() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h2 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          Products Description
        </h2>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Row 1: Product Name & Category */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-name">Product Name</FieldLabel>
            <Input id="product-name" placeholder="Enter product name" />
          </Field>

          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Row 2: Brand & Color */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel>Brand</FieldLabel>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.value} value={brand.value}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Color</FieldLabel>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Row 3: Weight, Length, Width */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="product-weight">Weight (kg)</FieldLabel>
            <Input id="product-weight" placeholder="15" />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-length">Length (cm)</FieldLabel>
            <Input id="product-length" placeholder="120" />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-width">Width (cm)</FieldLabel>
            <Input id="product-width" placeholder="23" />
          </Field>
        </div>

        {/* Row 4: Description */}
        <Field>
          <FieldLabel htmlFor="product-description">Description</FieldLabel>
          <Textarea
            id="product-description"
            rows={5}
            placeholder="Enter your description"
            className="min-h-36.75"
          />
        </Field>
      </div>
    </div>
  );
}
