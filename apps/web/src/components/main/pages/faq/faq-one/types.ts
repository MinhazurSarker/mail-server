export interface FaqItem {
  id?: string;
  title: string;
  content: string;
}

export interface FaqItemProps {
  item: FaqItem;
  value?: any;
  isOpen?: boolean;
  onToggle?: () => void;
}

export interface FaqOneProps {
  className?: string;
  items?: FaqItem[];
  defaultOpenIndex?: number | null;
}

