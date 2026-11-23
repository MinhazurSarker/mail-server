export type InvoiceStatus = "Paid" | "Overdue" | "Pending" | "Draft";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  createdDate: string;
  dueDate: string;
  total: string;
  status: InvoiceStatus;
}

export type InvoiceStatusFilter = "all" | "unpaid" | "draft";

export type InvoiceSortField = "customer" | "createdDate" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface InvoiceTableProps {
  initialData?: Invoice[];
  itemsPerPage?: number;
  className?: string;
  onExport?: () => void;
  onFilter?: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onDownloadInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

export interface InvoiceCardHeaderProps {
  title?: string;
  description?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: InvoiceStatusFilter;
  onStatusFilterChange?: (filter: InvoiceStatusFilter) => void;
  onFilter?: () => void;
  onExport?: () => void;
  className?: string;
}

export interface InvoiceRowProps {
  invoice: Invoice;
  isSelected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  className?: string;
}

export interface InvoiceCardFooterProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface InvoiceTableHeaderProps {
  isAllSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  sortField: InvoiceSortField | null;
  sortDirection: SortDirection;
  onSort: (field: InvoiceSortField) => void;
  className?: string;
}

export interface InvoiceEmptyStateProps {
  hasFiltersActive: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export interface InvoiceTableContentProps {
  invoices: Invoice[];
  selectedIds: Set<string>;
  isAllSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectRow: (id: string, checked: boolean) => void;
  sortField: InvoiceSortField | null;
  sortDirection: SortDirection;
  onSort: (field: InvoiceSortField) => void;
  hasFiltersActive: boolean;
  onClearFilters?: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onDownloadInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
  className?: string;
}
