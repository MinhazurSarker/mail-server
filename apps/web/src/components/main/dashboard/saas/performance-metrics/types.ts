export type PerformanceTab = "daily" | "online" | "new";

export interface PerformanceTabItem {
  id: PerformanceTab;
  labelKey: string;
}

export interface ProductMetric {
  value: string;
  isPositive: boolean;
}

export interface MainStat {
  titleKey: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface PerformanceMetricData {
  digitalProduct: ProductMetric;
  physicalProduct: ProductMetric;
  mainStat: MainStat;
  chartData: number[];
  categories: string[];
}
