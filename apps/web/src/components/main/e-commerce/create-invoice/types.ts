export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  discount: number;
  total: number;
}

export interface InvoiceDetailsData {
  invoiceNumber: string;
  customer: string;
  customerAddress: string;
  paymentCondition: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  additionalInfo: string;
}
