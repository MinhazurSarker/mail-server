import { CartIcon } from "@/icons/cart";
import { EnvelopeIcon } from "@/icons/envelope";
import { CreditCardDollarIcon } from "./icons";
import { OrderHistoryItem } from "./types";

export const defaultOrderHistoryItems: OrderHistoryItem[] = [
  {
    id: 1,
    title: "Checkout Started",
    subtitle: "via tailadmin.com",
    time: "12:54",
    date: "12th Apr 28",
    icon: <CartIcon className="size-4.5 text-gray-700 dark:text-gray-300" />,
  },
  {
    id: 2,
    title: "Purchased",
    subtitle: "for US$4,235 via PayPal",
    time: "12:58",
    date: "12th Apr 28",
    icon: (
      <CreditCardDollarIcon className="size-4.5 text-gray-700 dark:text-gray-300" />
    ),
  },
  {
    id: 3,
    title: "Receipt Email Sent",
    subtitle: "Receipt #1734535",
    time: "12:58",
    date: "12th Apr 28",
    icon: (
      <EnvelopeIcon className="size-4.5 text-gray-700 dark:text-gray-300" />
    ),
    actions: [{ label: "Resend" }, { label: "Forward" }, { label: "Preview" }],
  },
];
