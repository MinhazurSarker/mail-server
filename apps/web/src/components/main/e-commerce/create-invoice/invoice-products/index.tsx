"use client";

import { InvoiceItem } from "../types";
import AddProductForm from "./add-product-form";
import OrderSummary from "./order-summery";
import ProductTable from "./product-table";

interface InvoiceProductsProps {
  items: InvoiceItem[];
  onAddItem: (item: Omit<InvoiceItem, "id" | "total">) => void;
  onRemoveItem: (id: string) => void;
}

export default function InvoiceProducts({
  items,
  onAddItem,
  onRemoveItem,
}: InvoiceProductsProps) {
  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  return (
    <div className="p-6 sm:p-8">
      {/* Table Container */}
      <ProductTable items={items} onRemoveItem={onRemoveItem} />

      {/* Add Product Form Box */}
      <AddProductForm onAddItem={onAddItem} />

      {/* Order Summary */}
      <OrderSummary subtotal={subtotal} vat={vat} total={total} />
    </div>
  );
}
