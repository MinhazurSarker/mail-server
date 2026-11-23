export type TransactionStatus = "Completed" | "Pending" | "Failed";

export interface Transaction {
  id: number | string;
  orderId: string;
  customer: string;
  email: string;
  totalAmount: string;
  dueDate: string;
  status: TransactionStatus;
}

export type TransactionSortField = "customer" | "email" | "totalAmount" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface TransactionTableProps {
  initialData?: Transaction[];
  itemsPerPage?: number;
  className?: string;
  onExportCsv?: () => void;
  onViewTransaction?: (transaction: Transaction) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
}

export interface TransactionCardHeaderProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  onExportCsv?: () => void;
  className?: string;
}

export interface TransactionRowProps {
  transaction: Transaction;
  isSelected?: boolean;
  onSelect?: (id: number | string, selected: boolean) => void;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  className?: string;
}

export interface TransactionCardFooterProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}
