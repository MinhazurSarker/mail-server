export interface FaqTwoItem {
  id?: string;
  title: string;
  content: string;
}

export interface FaqTwoItemProps {
  item: FaqTwoItem;
  value?: any;
  isOpen?: boolean;
  onToggle?: () => void;
}

export interface FaqTwoProps {
  className?: string;
  items?: FaqTwoItem[];
  defaultOpenIndex?: number | null;
}

