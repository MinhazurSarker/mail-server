"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import QuickSendHeader from "./card-header";
import { currencies, paymentMethods, recipients } from "./data";
import RecipientList from "./recipient-list";
import SendForm from "./send-form";
import { CurrencyOption, PaymentMethod } from "./types";

export default function QuickSendWidget() {
  const [selectedRecipientId, setSelectedRecipientId] = useState<number>(
    recipients[0]?.id ?? 17,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(paymentMethods[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(
    currencies[0],
  );
  const [amount, setAmount] = useState<string>("");

  const handleSend = () => {
    // Action handler when money is sent
  };

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <QuickSendHeader />
      <CardContent className="flex flex-col gap-3.5 p-0">
        <RecipientList
          recipients={recipients}
          selectedId={selectedRecipientId}
          onSelectRecipient={setSelectedRecipientId}
        />
        <SendForm
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={setSelectedPaymentMethod}
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          amount={amount}
          onAmountChange={setAmount}
          onSubmit={handleSend}
        />
      </CardContent>
    </Card>
  );
}
