import * as satellite from "satellite.js";
import type { SatelliteData } from "../types";

export function parseTLEs(tleText: string): SatelliteData[] {
  const lines = tleText.trim().split("\n");
  const satellites: SatelliteData[] = [];

  for (let i = 0; i < lines.length - 2; i += 3) {
    const name = lines[i].trim();
    const tle1 = lines[i + 1].trim();
    const tle2 = lines[i + 2].trim();

    if (!tle1.startsWith("1 ") || !tle2.startsWith("2 ")) continue;

    const noradId = tle1.substring(2, 7).trim();

    satellites.push({
      id: noradId,
      name,
      tle1,
      tle2,
      lat: 0,
      lon: 0,
      alt: 0,
    });
  }

  return satellites;
}

export function propagateSatellite(
  sat: SatelliteData,
  date: Date,
): { lat: number; lon: number; alt: number } | null {
  try {
    const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (
      !positionAndVelocity ||
      typeof positionAndVelocity.position === "boolean" ||
      !positionAndVelocity.position
    ) {
      return null;
    }

    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    return {
      lat: satellite.degreesLat(geo.latitude),
      lon: satellite.degreesLong(geo.longitude),
      alt: geo.height, // km
    };
  } catch {
    return null;
  }
}

export function computeOrbitPath(
  sat: SatelliteData,
  startDate: Date,
  points: number = 180,
): { lat: number; lon: number; alt: number }[] {
  const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
  const meanMotion = satrec.no; // radians per minute
  const orbitalPeriod = (2 * Math.PI) / meanMotion; // minutes
  const stepMinutes = orbitalPeriod / points;
  const path: { lat: number; lon: number; alt: number }[] = [];

  for (let i = 0; i <= points; i++) {
    const time = new Date(
      startDate.getTime() + i * stepMinutes * 60 * 1000,
    );
    const pos = propagateSatellite(sat, time);
    if (pos) path.push(pos);
  }

  return path;
}
