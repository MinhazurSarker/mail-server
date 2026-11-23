export type InvoiceStatus = "complete" | "pending" | "cancelled";

export interface Invoice {
  id: string;
  closeDate: string;
  user: string;
  amount: string;
  status: InvoiceStatus;
}
