"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import TransactionItem from "./transaction-item";
import { Transaction } from "./types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  onSeeAll?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
}

export default function RecentTransactions({
  transactions,
  onSeeAll,
  onTransactionClick,
}: RecentTransactionsProps) {
  const t = useTranslations("finance.myCards");

  return (
    <div className="pt-6">
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {t("recentTransactions")}
      </p>
      <ul className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction)}
          />
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onSeeAll}
        className="mt-3 w-full"
      >
        {t("seeAllTransactions")}
      </Button>
    </div>
  );
}
