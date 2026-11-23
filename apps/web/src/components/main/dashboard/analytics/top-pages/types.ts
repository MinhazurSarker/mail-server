export interface PageItem {
  id: number | string;
  path: string;
  pageviews: string;
}

export interface TopPagesProps {
  data?: PageItem[];
  className?: string;
}
