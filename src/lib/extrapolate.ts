import type { FlightData } from "../types";

/**
 * Extrapolate flight positions forward by dtSeconds using velocity + heading.
 * Works for any type extending FlightData (including MilitaryFlightData).
 */
export function extrapolateFlights<T extends FlightData>(
  flights: T[],
  dtSeconds: number,
): T[] {
  if (dtSeconds === 0) return flights;

  return flights.map((f) => {
    if (f.onGround || f.velocity === 0) return f;

    const headingRad = (f.heading * Math.PI) / 180;
    const latRad = (f.lat * Math.PI) / 180;
    const cosLat = Math.cos(latRad);

    // velocity is m/s, 111320 meters per degree latitude
    const dLat = (f.velocity * Math.cos(headingRad) * dtSeconds) / 111320;
    const dLon =
      cosLat !== 0
        ? (f.velocity * Math.sin(headingRad) * dtSeconds) / (111320 * cosLat)
        : 0;

    return {
      ...f,
      lat: f.lat + dLat,
      lon: f.lon + dLon,
    };
  });
}
