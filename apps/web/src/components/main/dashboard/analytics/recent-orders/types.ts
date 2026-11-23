export type AnalyticsOrderCategory = "uiKits" | "templates" | "saas";

export interface AnalyticsOrder {
  id: number;
  name: string;
  category: AnalyticsOrderCategory;
  country: string;
  cr: string;
  value: string;
}
