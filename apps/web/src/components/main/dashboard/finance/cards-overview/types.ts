export interface CardItem {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  status: "active" | "inactive";
  bgImage?: string;
  brandLogo?: string;
}

export interface Transaction {
  id: string;
  titleKey?: string;
  fallbackTitle: string;
  descKey?: string;
  fallbackDesc: string;
  amount: string;
  isPositive: boolean;
  date: string;
  icon: string;
  darkIcon?: string;
}
