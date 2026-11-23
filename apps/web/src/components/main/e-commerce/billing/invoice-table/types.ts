export type InvoiceStatus = "Paid" | "Unpaid";

export interface Invoice {
  id: number;
  name: string;
  date: string;
  price: string;
  plan: string;
  status: InvoiceStatus;
  downloadUrl?: string;
}

export interface InvoiceTableProps {
  initialData?: Invoice[];
  itemsPerPage?: number;
  className?: string;
  onDownloadAll?: () => void;
  onDownloadInvoice?: (invoice: Invoice) => void;
  onViewInvoice?: (invoice: Invoice) => void;
}

export interface InvoiceCardHeaderProps {
  title?: string;
  description?: string;
  onDownloadAll?: () => void;
  className?: string;
}

export interface InvoiceRowProps {
  invoice: Invoice;
  onDownload?: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
  className?: string;
}

export interface InvoiceCardFooterProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}
