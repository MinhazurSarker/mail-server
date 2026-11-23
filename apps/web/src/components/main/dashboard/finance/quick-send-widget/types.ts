export interface Recipient {
  id: number;
  avatar: string;
  name?: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
}

export interface CurrencyOption {
  code: string;
  label: string;
}
