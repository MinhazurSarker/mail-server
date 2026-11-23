import { InvoiceDetailsData, InvoiceItem } from "./types";

export const initialDetails: InvoiceDetailsData = {
  invoiceNumber: "WP-3434434",
  customer: "Jhon Deniyal",
  customerAddress: "Enter customer address",
  paymentCondition: "Net 15",
  currency: "United States Dollar (USD)",
  issueDate: "11 March, 2027",
  dueDate: "16 March, 2027",
  additionalInfo: "",
};

export const initialItems: InvoiceItem[] = [
  {
    id: "1",
    name: 'Macbook pro 13"',
    quantity: 1,
    unitCost: 1200,
    discount: 0,
    total: 1200,
  },
  {
    id: "2",
    name: "Apple Watch Ultra",
    quantity: 1,
    unitCost: 300,
    discount: 50,
    total: 150,
  },
  {
    id: "3",
    name: "iPhone 15 Pro Max",
    quantity: 2,
    unitCost: 800,
    discount: 0,
    total: 1600,
  },
  {
    id: "4",
    name: "iPad Pro 3rd Gen",
    quantity: 1,
    unitCost: 900,
    discount: 0,
    total: 900,
  },
];
