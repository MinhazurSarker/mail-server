export interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  brand: string;
  price: string;
  stock: "In Stock" | "Out of Stock" | string;
  createdAt: string;
}

export type SortKey = "name" | "category" | "brand" | "price" | "createdAt";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export interface ProductListFilterState {
  search: string;
  category: string;
  stock: string;
}
