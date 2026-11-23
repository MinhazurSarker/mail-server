export type DealStatus = "complete" | "pending" | "cancel";

export type ProductKey =
  | "softwareLicense"
  | "cloudHosting"
  | "webDomain"
  | "sslCertificate"
  | "premiumSupport";

export interface OrderUser {
  name: string;
  email: string;
  initials: string;
  avatarClassName?: string;
}

export interface CrmOrder {
  id: string;
  dealId: string;
  user: OrderUser;
  productKey: ProductKey;
  dealValue: string;
  closeDate: string;
  status: DealStatus;
}
