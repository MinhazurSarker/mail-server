import { OrderItem, OrderSummaryData } from "./types";

export const initialOrderItems: OrderItem[] = [
  {
    id: 1,
    product: "Macbook pro 13”",
    quantity: 1,
    unitCost: 1200,
    discount: 0,
    total: 1200,
  },
  {
    id: 2,
    product: "Apple Watch Ultra",
    quantity: 1,
    unitCost: 300,
    discount: 50,
    total: 150,
  },
  {
    id: 3,
    product: "iPhone 15 Pro Max",
    quantity: 2,
    unitCost: 800,
    discount: 0,
    total: 1600,
  },
  {
    id: 4,
    product: "iPad Pro 3rd Gen",
    quantity: 1,
    unitCost: 900,
    discount: 0,
    total: 900,
  },
  {
    id: 5,
    product: "MacBook Pro M4",
    quantity: 1,
    unitCost: 1900,
    discount: 0,
    total: 1900,
  },
];

export const initialOrderSummary: OrderSummaryData = {
  subtotal: 3850,
  vatRate: 10,
  vatAmount: 385,
  total: 6325,
};
