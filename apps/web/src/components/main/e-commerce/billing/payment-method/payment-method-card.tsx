"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, MastercardIcon, PaypalIcon, VisaIcon } from "@/icons";
import { cn } from "@/utils";
import * as React from "react";
import { PaymentMethodCardProps } from "./types";

export default function PaymentMethodCard({
  method,
  className,
  onMakeDefault,
  onEdit,
  onDelete,
}: PaymentMethodCardProps) {
  const renderIcon = () => {
    switch (method.type) {
      case "mastercard":
        return <MastercardIcon className="size-8 shrink-0" />;
      case "visa":
        return <VisaIcon className="h-4.5 w-8 shrink-0" />;
      case "paypal":
        return (
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B4BF1]">
            <PaypalIcon className="h-4.5 w-auto" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-1 items-start gap-5 rounded-xl border border-gray-200 bg-white pb-5 pe-5 ps-3 pt-3 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex size-13 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 dark:border-gray-800 dark:bg-white/5">
        {renderIcon()}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <h4 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
            {method.title}
          </h4>
          {method.isDefault && (
            <Badge
              variant="light"
              color="success"
              size="sm"
              className="gap-1 px-2 py-0.5 text-xs font-medium"
            >
              <CheckIcon className="size-3" />
              Default
            </Badge>
          )}
        </div>

        <div className="flex w-full flex-col gap-4">
          {method.cardNumber ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              <span className="whitespace-pre">{method.cardNumber}</span>
              {method.expiryDate && (
                <span className="whitespace-nowrap">{method.expiryDate}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
              <span className="whitespace-nowrap">{method.email}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {!method.isDefault && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onMakeDefault?.(method.id)}
                className="h-7 rounded-md px-3 text-xs font-medium"
              >
                Make Default
              </Button>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={() => onEdit?.(method.id)}
              className="h-7 rounded-md px-3 text-xs font-medium"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onDelete?.(method.id)}
              className="h-7 rounded-md px-3 text-xs font-medium"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
