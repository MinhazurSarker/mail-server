"use client";

import VectorMap, {
  type VectorMapMarker,
} from "@/components/common/vector-map";
import { useVectorMapTheme } from "@/hooks/use-vector-map-theme";
import { useMemo } from "react";
import { countrySalesData } from "./data";

export default function CountryMap() {
  const { colors, regionStyle, markerStyle } = useVectorMapTheme();

  // Markers and highlighted regions follow the country list below the map.
  const markers = useMemo<VectorMapMarker[]>(
    () =>
      countrySalesData.map((country) => ({
        name: country.name,
        latLng: country.latLng,
      })),
    [],
  );

  const series = useMemo(
    () => ({
      regions: [
        {
          attribute: "fill",
          scale: { highlight: colors.heatRamp[1] },
          values: Object.fromEntries(
            countrySalesData.map((country) => [country.code, "highlight"]),
          ),
        },
      ],
    }),
    [colors],
  );

  const salesRegionStyle = useMemo(
    () => ({
      ...regionStyle,
      initial: {
        ...regionStyle.initial,
        stroke: "transparent",
        strokeWidth: 1,
      },
      hover: { ...regionStyle.hover, fill: colors.regionHover },
    }),
    [colors, regionStyle],
  );

  const salesMarkerStyle = useMemo(
    () => ({
      ...markerStyle,
      initial: { ...markerStyle.initial, r: 4, strokeWidth: 1.5 },
    }),
    [markerStyle],
  );

  return (
    <div className="relative h-40.5 w-full overflow-hidden bg-transparent">
      <VectorMap
        map="world"
        markers={markers}
        markerStyle={salesMarkerStyle}
        regionStyle={salesRegionStyle}
        series={series}
      />
    </div>
  );
}
