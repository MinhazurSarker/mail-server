import { PaymentMethodItem } from "./types";

export const defaultPaymentMethods: PaymentMethodItem[] = [
  {
    id: "1",
    title: "Mastercard",
    type: "mastercard",
    isDefault: true,
    cardNumber: "****  ****  **** 9029",
    expiryDate: "Expiry 01/24",
  },
  {
    id: "2",
    title: "Visa",
    type: "visa",
    isDefault: false,
    cardNumber: "****  ****  **** 4328",
    expiryDate: "Expiry 01/25",
  },
  {
    id: "3",
    title: "Paypal",
    type: "paypal",
    isDefault: false,
    email: "name@example.com",
  },
];
