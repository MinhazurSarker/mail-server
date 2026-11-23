"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import AmountInput from "./amount-input";
import CurrencySelect from "./currency-select";
import SendFromSelect from "./send-from-select";
import { CurrencyOption, PaymentMethod } from "./types";

interface SendFormProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  currencies: CurrencyOption[];
  selectedCurrency: CurrencyOption;
  onSelectCurrency: (currency: CurrencyOption) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export default function SendForm({
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  currencies,
  selectedCurrency,
  onSelectCurrency,
  amount,
  onAmountChange,
  onSubmit,
  className,
}: SendFormProps) {
  const t = useTranslations("finance.quickSend");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3.5", className)}
    >
      <SendFromSelect
        paymentMethods={paymentMethods}
        selectedMethod={selectedPaymentMethod}
        onSelectMethod={onSelectPaymentMethod}
      />

      <div className="grid grid-cols-2 gap-3">
        <CurrencySelect
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={onSelectCurrency}
        />
        <AmountInput value={amount} onChange={onAmountChange} />
      </div>

      <Button
        type="submit"
        variant="default"
        className="mt-1 h-10 w-full rounded-[10px] bg-brand-500 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 sm:h-11"
      >
        {t("sendMoney")}
      </Button>
    </form>
  );
}
