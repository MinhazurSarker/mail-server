"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Transaction } from "./types";

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export default function TransactionItem({
  transaction,
  onClick,
}: TransactionItemProps) {
  const t = useTranslations("finance.myCards");

  const title = transaction.titleKey
    ? t(transaction.titleKey)
    : transaction.fallbackTitle;

  const desc = transaction.descKey
    ? t(transaction.descKey)
    : transaction.fallbackDesc;

  return (
    <li onClick={onClick}>
      <Link
        href="#"
        className="group/transaction -mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-100/70"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-200 shadow-xs dark:border-gray-800">
            {transaction.darkIcon ? (
              <>
                <Image
                  src={transaction.icon}
                  width={20}
                  height={20}
                  className="block size-5 dark:hidden"
                  alt={title}
                />
                <Image
                  src={transaction.darkIcon}
                  width={20}
                  height={20}
                  className="hidden size-5 dark:block"
                  alt={title}
                />
              </>
            ) : (
              <Image
                src={transaction.icon}
                width={20}
                height={20}
                className="size-5"
                alt={title}
              />
            )}
          </div>
          <div className="min-w-0">
            <h5 className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {title}
            </h5>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 text-end">
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                transaction.isPositive
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500",
              )}
            >
              {transaction.amount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {transaction.date}
            </p>
          </div>
          <div className="text-gray-400 group-hover/transaction:text-gray-600 dark:group-hover/transaction:text-gray-300">
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
          </div>
        </div>
      </Link>
    </li>
  );
}
