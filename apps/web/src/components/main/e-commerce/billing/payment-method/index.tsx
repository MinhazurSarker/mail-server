"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "@/icons";
import { cn } from "@/utils";
import * as React from "react";
import { defaultPaymentMethods } from "./data";
import PaymentMethodCard from "./payment-method-card";
import { PaymentMethodItem, PaymentMethodsProps } from "./types";

export default function PaymentMethods({
  initialMethods,
  className,
  onAddCard,
  onMakeDefault,
  onEdit,
  onDelete,
}: PaymentMethodsProps) {
  const [methods, setMethods] = React.useState<PaymentMethodItem[]>(
    initialMethods ?? defaultPaymentMethods,
  );

  const handleMakeDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      })),
    );
    onMakeDefault?.(id);
  };

  const handleDelete = (id: string) => {
    setMethods((prev) => prev.filter((item) => item.id !== id));
    onDelete?.(id);
  };

  const handleEdit = (id: string) => {
    onEdit?.(id);
  };

  const handleAddCard = () => {
    onAddCard?.();
  };

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <CardTitle className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          Payment Methods
        </CardTitle>
        <Button
          variant="outline"
          onClick={handleAddCard}
          className="h-10 gap-2 rounded-[10px] px-4 text-sm font-medium"
        >
          <PlusIcon className="size-5" />
          Add New Card
        </Button>
      </CardHeader>

      <CardContent className="mt-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onMakeDefault={handleMakeDefault}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
