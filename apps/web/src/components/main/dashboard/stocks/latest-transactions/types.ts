export type TransactionStatus = "success" | "pending" | "failed";

export type TransactionCategory =
  "finance" | "technology" | "ecommerce" | "media";

export type TransactionBrand =
  "paypal" | "apple" | "netflix" | "tesla" | "amazon" | "spotify" | "envato";

export interface Transaction {
  id: number;
  name: string;
  brand: TransactionBrand;
  date: string;
  price: string;
  category: TransactionCategory;
  status: TransactionStatus;
}
