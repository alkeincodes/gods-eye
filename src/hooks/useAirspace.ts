import { useMemo, useEffect } from "react";
import { useLayerStore } from "../stores/useLayerStore";
import type { AirspaceZone } from "../types";

const AIRSPACE_ZONES: AirspaceZone[] = [
  {
    id: "airspace-ukraine",
    name: "Ukraine Conflict Zone",
    type: "conflict",
    polygon: [
      [22.14, 52.38],
      [40.23, 52.38],
      [40.23, 44.39],
      [36.62, 46.19],
      [31.78, 46.13],
      [22.14, 48.06],
    ],
    description: "Active conflict zone - all civilian aviation prohibited",
  },
  {
    id: "airspace-syria",
    name: "Syria Restricted Airspace",
    type: "restricted",
    polygon: [
      [35.73, 33.06],
      [42.38, 37.32],
      [42.38, 33.06],
      [40.92, 33.06],
      [38.79, 34.45],
      [35.73, 35.84],
    ],
    description: "Restricted airspace due to ongoing military operations",
  },
  {
    id: "airspace-north-korea",
    name: "North Korea Airspace",
    type: "restricted",
    polygon: [
      [124.21, 37.75],
      [130.78, 42.99],
      [130.78, 37.75],
      [129.03, 38.61],
      [126.04, 37.75],
    ],
    description: "Restricted airspace - unauthorized entry prohibited",
  },
  {
    id: "airspace-iran-adiz",
    name: "Iran ADIZ",
    type: "adiz",
    polygon: [
      [44.05, 39.78],
      [63.32, 39.78],
      [63.32, 25.07],
      [51.42, 24.4],
      [44.05, 30.0],
    ],
    description: "Air Defense Identification Zone - identification required",
  },
  {
    id: "airspace-yemen",
    name: "Yemen Conflict Zone",
    type: "conflict",
    polygon: [
      [42.56, 16.95],
      [54.0, 16.95],
      [54.0, 12.11],
      [43.42, 12.63],
      [42.56, 13.0],
    ],
    description: "Active conflict zone - aviation risk area",
  },
  {
    id: "airspace-libya",
    name: "Libya Restricted",
    type: "restricted",
    polygon: [
      [9.39, 33.17],
      [25.15, 33.17],
      [25.15, 19.51],
      [9.39, 19.51],
    ],
    description: "Restricted airspace due to instability",
  },
];

export function useAirspace() {
  const setCount = useLayerStore((s) => s.setCount);

  const zones = useMemo(() => AIRSPACE_ZONES, []);

  useEffect(() => {
    setCount("airspace", zones.length);
  }, [zones, setCount]);

  return { zones };
}
