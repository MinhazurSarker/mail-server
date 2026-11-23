import type { CountrySaleItem } from "./types";

export const countrySalesData: CountrySaleItem[] = [
  {
    id: "usa",
    nameKey: "usa",
    name: "USA",
    code: "US",
    latLng: [37.26, -104.66],
    flag: "/images/country/country-01.svg",
    value: "$20.594",
    percentage: "79%",
  },
  {
    id: "france",
    nameKey: "france",
    name: "France",
    code: "FR",
    latLng: [46.23, 2.21],
    flag: "/images/country/country-02.svg",
    value: "$20.594",
    percentage: "79%",
  },
  {
    id: "egypt",
    nameKey: "egypt",
    name: "Egypt",
    code: "EG",
    latLng: [26.82, 30.8],
    flag: "/images/country/country-05.svg",
    value: "$15.230",
    percentage: "68%",
  },
  {
    id: "germany",
    nameKey: "germany",
    name: "Germany",
    code: "DE",
    latLng: [51.17, 10.45],
    flag: "/images/country/country-07.svg",
    value: "$16.450",
    percentage: "72%",
  },
];
