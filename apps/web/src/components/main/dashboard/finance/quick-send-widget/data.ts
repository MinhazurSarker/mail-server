import { CurrencyOption, PaymentMethod, Recipient } from "./types";

export const recipients: Recipient[] = [
  { id: 17, avatar: "/images/user/user-17.jpg", name: "Alex Morgan" },
  { id: 18, avatar: "/images/user/user-18.jpg", name: "Sophia Davis" },
  { id: 19, avatar: "/images/user/user-19.jpg", name: "Emma Watson" },
  { id: 20, avatar: "/images/user/user-20.jpg", name: "James Wilson" },
  { id: 21, avatar: "/images/user/user-21.jpg", name: "Michael Brown" },
  { id: 22, avatar: "/images/user/user-22.jpg", name: "Olivia Taylor" },
  { id: 23, avatar: "/images/user/user-23.jpg", name: "Daniel Martinez" },
  { id: 24, avatar: "/images/user/user-24.jpg", name: "Emily Clark" },
  { id: 25, avatar: "/images/user/user-25.jpg", name: "David Anderson" },
  { id: 26, avatar: "/images/user/user-26.jpg", name: "Jessica White" },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "visa-3657", label: "Visa •••• •••• 3657" },
  { id: "master-4912", label: "Master •••• •••• 4912" },
];

export const currencies: CurrencyOption[] = [
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
];
