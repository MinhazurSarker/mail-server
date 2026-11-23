export interface TransactionHeaderProps {
  orderId?: string;
  status?: string;
  dueDate?: string;
  className?: string;
  onViewReceipt?: () => void;
  onRefund?: () => void;
}
