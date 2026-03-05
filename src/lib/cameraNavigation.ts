import {
  Cartesian3,
  BoundingSphere,
  HeadingPitchRange,
  Math as CesiumMath,
  Viewer as CesiumViewer,
} from "cesium";
import type { LandmarkCity } from "../types";
import { CITIES } from "./landmarks";

const LANDMARK_ZOOM_SCALE = 0.4;
const LANDMARK_MIN_ALT_METERS = 250;
const CITY_OVERVIEW_ALT_METERS = 2_500_000;

export function getViewer(): CesiumViewer | null {
  return (
    ((window as unknown as Record<string, unknown>).__cesiumViewer as
      | CesiumViewer
      | undefined) ?? null
  );
}

export function computeLandmarkZoomAltitude(landmarkAltitude: number): number {
  return Math.max(
    LANDMARK_MIN_ALT_METERS,
    Math.round(landmarkAltitude * LANDMARK_ZOOM_SCALE),
  );
}

export function computeCityCenter(city: LandmarkCity): { lat: number; lon: number } {
  const count = city.landmarks.length;
  if (count === 0) return { lat: 0, lon: 0 };

  let latSum = 0;
  let lonSum = 0;
  for (const landmark of city.landmarks) {
    latSum += landmark.lat;
    lonSum += landmark.lon;
  }

  return {
    lat: latSum / count,
    lon: lonSum / count,
  };
}

export function flyToLandmark(
  cityIdx: number,
  landmarkIdx: number,
  duration: number = 1.5,
): boolean {
  const viewer = getViewer();
  if (!viewer) return false;

  const city = CITIES[cityIdx];
  if (!city) return false;

  const landmark = city.landmarks[landmarkIdx];
  if (!landmark) return false;

  // Use a target-centered flight so the selected landmark lands in view center.
  const center = Cartesian3.fromDegrees(landmark.lon, landmark.lat, 0);
  const range = computeLandmarkZoomAltitude(landmark.altitude);
  viewer.camera.flyToBoundingSphere(new BoundingSphere(center, 1), {
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(landmark.heading),
      CesiumMath.toRadians(landmark.pitch),
      range,
    ),
    duration,
  });

  return true;
}

export function flyToEntity(
  lat: number,
  lon: number,
  alt: number,
  type: "flights" | "military" | "satellites",
  duration: number = 1.5,
): boolean {
  const viewer = getViewer();
  if (!viewer) return false;

  // Satellites: alt is in km, convert to meters; aircraft: alt already in meters
  const altMeters = type === "satellites" ? alt * 1000 : alt;
  const range =
    type === "satellites" ? 500_000 : Math.max(5000, altMeters * 2);

  const center = Cartesian3.fromDegrees(lon, lat, altMeters);
  viewer.camera.flyToBoundingSphere(new BoundingSphere(center, 1), {
    offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90), range),
    duration,
  });

  return true;
}

export function flyToCityOverview(
  cityIdx: number,
  duration: number = 1.2,
): boolean {
  const viewer = getViewer();
  if (!viewer) return false;

  const city = CITIES[cityIdx];
  if (!city || city.landmarks.length === 0) return false;

  const center = computeCityCenter(city);
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(
      center.lon,
      center.lat,
      CITY_OVERVIEW_ALT_METERS,
    ),
    orientation: {
      heading: 0,
      pitch: CesiumMath.toRadians(-90),
      roll: 0,
    },
    duration,
  });

  return true;
}
