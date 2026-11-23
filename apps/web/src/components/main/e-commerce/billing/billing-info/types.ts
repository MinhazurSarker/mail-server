export interface BillingAddressData {
  firstName: string;
  lastName: string;
  street: string;
  cityState: string;
  country: string;
  zipCode: string;
  townCity: string;
  vatNumber: string;
}

export interface BillingInfoItemProps {
  label: string;
  value: string;
  className?: string;
}

export interface EditBillingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: BillingAddressData;
  onSave: (updatedData: BillingAddressData) => void;
}

export interface BillingInfoProps {
  initialData?: BillingAddressData;
  className?: string;
  onUpdate?: (data: BillingAddressData) => void;
}
