import { COUNTRY_CENTROIDS } from "./countries";

export interface CountryLabelPoint {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

const COUNTRY_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function getCountryName(code: string): string {
  const normalized = code.toUpperCase();
  return COUNTRY_NAMES?.of(normalized) ?? normalized;
}

export function buildCountryLabels(): CountryLabelPoint[] {
  return Object.entries(COUNTRY_CENTROIDS)
    .map(([code, coords]) => ({
      code,
      name: getCountryName(code),
      lat: coords.lat,
      lon: coords.lon,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

