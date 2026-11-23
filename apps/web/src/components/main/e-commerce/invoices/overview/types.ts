export interface InvoiceMetricItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface MetricItemProps {
  item: InvoiceMetricItem;
  index: number;
  className?: string;
}

export interface InvoiceOverviewProps {
  title?: string;
  createButtonText?: string;
  onCreateInvoice?: () => void;
  metrics?: InvoiceMetricItem[];
  className?: string;
}
