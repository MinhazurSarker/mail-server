export interface OrderItem {
  id: number;
  product: string;
  quantity: number;
  unitCost: number;
  discount: number;
  total: number;
}

export interface OrderSummaryData {
  subtotal: number;
  vatRate: number; // e.g. 0.1 for 10%
  vatAmount: number;
  total: number;
}

export interface OrderDetailsProps {
  items?: OrderItem[];
  summary?: OrderSummaryData;
  className?: string;
  title?: string;
}
