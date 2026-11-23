import * as React from "react";

export interface FaqThreeItem {
  id?: string;
  title: string;
  content: React.ReactNode;
}

export interface FaqItemProps {
  item: FaqThreeItem;
  value?: any;
}

export interface FaqThreeProps {
  className?: string;
  items?: FaqThreeItem[];
  defaultOpenIndex?: number | null;
}


