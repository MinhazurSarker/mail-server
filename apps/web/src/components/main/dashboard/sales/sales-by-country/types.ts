export interface CountrySaleItem {
  id: string;
  nameKey: "usa" | "france" | "egypt" | "germany";
  name: string;
  /** ISO 3166-1 alpha-2 code used to highlight the country on the map */
  code: string;
  latLng: [number, number];
  flag: string;
  value: string;
  percentage: string;
}
