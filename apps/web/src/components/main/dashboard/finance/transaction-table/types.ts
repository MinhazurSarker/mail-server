export type ActivityKey =
  | "hotelBooking"
  | "onlineShopping"
  | "gamePurchase"
  | "utilityBillPayment"
  | "onlineCourseEnrollment";

export type StatusKey = "completed" | "inProgress";

export type TransactionStatusFilter = StatusKey | "all";

export interface Transaction {
  id: string;
  orderId: string;
  activityKey: ActivityKey;
  price: string;
  date: string;
  statusKey: StatusKey;
}

export interface TransactionTableProps {
  data?: Transaction[];
  className?: string;
  statusFilter?: TransactionStatusFilter;
  onDelete?: (transaction: Transaction) => void;
  onViewMore?: (transaction: Transaction) => void;
  onFilterClick?: () => void;
}
