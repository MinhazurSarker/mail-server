import { InvoiceMetricItem } from "./types";

export const defaultInvoiceMetrics: InvoiceMetricItem[] = [
  {
    id: "overdue",
    label: "Overdue",
    value: "$120.80",
  },
  {
    id: "due-next-30-days",
    label: "Due within next 30 days",
    value: "0.00",
  },
  {
    id: "avg-time-to-pay",
    label: "Average time to get paid",
    value: "24",
    unit: "days",
  },
  {
    id: "upcoming-payout",
    label: "Upcoming Payout",
    value: "$3450.50",
  },
];
