export type DeliveryStatus =
  | "delivered"
  | "in-transit"
  | "canceled"
  | "pending"
  | "processing";

export type DeliveryCategory =
  | "furniture"
  | "clothing"
  | "books"
  | "automotive"
  | "electronics"
  | "health"
  | "toys"
  | "kitchen"
  | "beauty"
  | "sports";

export interface DeliveryActivity {
  id: string;
  category: DeliveryCategory;
  company: string;
  arrival: string;
  route: string;
  price: string;
  status: DeliveryStatus;
}

export type DeliveryTab =
  | "all"
  | "delivered"
  | "in-transit"
  | "pending"
  | "processing";

export type SortColumn = keyof DeliveryActivity | null;
export type SortDirection = "asc" | "desc";

export interface DeliveryStatTableProps {
  data?: DeliveryActivity[];
  className?: string;
}
