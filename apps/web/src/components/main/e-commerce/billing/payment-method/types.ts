export type PaymentMethodType = "mastercard" | "visa" | "paypal";

export interface PaymentMethodItem {
  id: string;
  title: string;
  type: PaymentMethodType;
  isDefault?: boolean;
  cardNumber?: string;
  expiryDate?: string;
  email?: string;
}

export interface PaymentMethodCardProps {
  method: PaymentMethodItem;
  className?: string;
  onMakeDefault?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface PaymentMethodsProps {
  initialMethods?: PaymentMethodItem[];
  className?: string;
  onAddCard?: () => void;
  onMakeDefault?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
