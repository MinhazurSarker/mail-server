export interface InvoiceParty {
  label: string;
  name: string;
  addressLines: string[];
  dateLabel: string;
  date: string;
}

export interface InvoiceItem {
  id: number | string;
  product: string;
  quantity: number;
  unitCost: number;
  discount: number;
  total: number;
}

export interface InvoiceSummaryData {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export interface InvoiceData {
  invoiceId: string;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceItem[];
  summary: InvoiceSummaryData;
}

export interface InvoiceHeaderProps {
  title?: string;
  invoiceId?: string;
  className?: string;
}

export interface InvoiceAddressProps {
  from?: InvoiceParty;
  to?: InvoiceParty;
  className?: string;
}

export interface InvoiceTableProps {
  items?: InvoiceItem[];
  className?: string;
}

export interface InvoiceSummaryProps {
  summary?: InvoiceSummaryData;
  className?: string;
}

export interface InvoiceActionsProps {
  onProceedPayment?: () => void;
  onPrint?: () => void;
  className?: string;
}

export interface SingleInvoiceProps {
  data?: InvoiceData;
  className?: string;
  onProceedPayment?: () => void;
  onPrint?: () => void;
}
