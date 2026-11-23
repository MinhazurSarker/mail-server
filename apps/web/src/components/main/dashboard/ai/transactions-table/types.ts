export type PackageKey = "starterMonthly" | "growthYearly" | "premiumMonthly";
export type StatusKey = "active" | "expired";

export type TransactionPackage = PackageKey;
export type TransactionStatus = StatusKey;

export interface Transaction {
  id: number;
  name: string;
  email: string;
  packageKey: PackageKey;
  price: string;
  paidDate: string;
  statusKey: StatusKey;
}
