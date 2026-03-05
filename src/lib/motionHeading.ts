const EARTH_RADIUS_METERS = 6_371_000;
const MIN_HEADING_DISTANCE_METERS = 150;
const MAX_HEADING_DISTANCE_METERS = 200_000;

export interface GeoPoint {
  lat: number;
  lon: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function normalizeDegrees(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((degrees % 360) + 360) % 360;
}

function haversineDistanceMeters(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function bearingBetweenPoints(from: GeoPoint, to: GeoPoint): number | null {
  if (from.lat === to.lat && from.lon === to.lon) return null;

  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLon = toRadians(to.lon - from.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

export function resolveHeadingFromMotion(
  previous: GeoPoint | null,
  current: GeoPoint,
  fallbackHeading: number,
): number {
  const normalizedFallback = normalizeDegrees(fallbackHeading);
  if (!previous) return normalizedFallback;

  const distanceMeters = haversineDistanceMeters(previous, current);
  if (
    distanceMeters < MIN_HEADING_DISTANCE_METERS ||
    distanceMeters > MAX_HEADING_DISTANCE_METERS
  ) {
    return normalizedFallback;
  }

  const derivedBearing = bearingBetweenPoints(previous, current);
  return derivedBearing ?? normalizedFallback;
}
