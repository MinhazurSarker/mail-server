export interface CustomerDetailsData {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
}

export interface CustomerDetailsProps {
  data?: CustomerDetailsData;
  className?: string;
  title?: string;
}
