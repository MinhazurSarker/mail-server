export interface Currency {
  name: string;
  flag: string;
}

export interface BalanceOverviewData {
  amount: string;
  percentage: string;
  isPositive: boolean;
  chartData: number[];
  accountNumber?: string;
}

export { currencies, periods } from "./data";

