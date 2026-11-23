export interface SalesCategoryItem {
  id: string;
  titleKey: "affiliateProgram" | "directBuy" | "adsense";
  percentage: number;
  productsCount: number;
  color: string;
  dotClass: string;
}
