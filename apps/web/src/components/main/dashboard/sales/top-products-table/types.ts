export type ProductStatusKey = "inStock" | "lowStock" | "outOfStock";

export type ProductNameKey =
  | "classicDenimJacket"
  | "slimFitChinos"
  | "organicCottonTShirt"
  | "leatherAnkleBoots"
  | "woolBlendScarf";

export type ProductVariantKey =
  | "threeSizes"
  | "fourColors"
  | "fiveColors"
  | "sixSizes"
  | "twoColors";

export type ProductCategoryKey =
  | "jacket"
  | "pants"
  | "tShirt"
  | "footwear"
  | "accessory";

export interface Product {
  id: number;
  image: string;
  nameKey: ProductNameKey;
  variantKey: ProductVariantKey;
  categoryKey: ProductCategoryKey;
  sales: number;
  earnings: string;
  stocks: number;
  status: ProductStatusKey;
}
