import { describe, expect, it, vi } from "vitest";
import {
  computeCityCenter,
  computeLandmarkZoomAltitude,
  flyToLandmark,
} from "./cameraNavigation";

describe("cameraNavigation", () => {
  it("zooms landmarks in closer than configured landmark altitude", () => {
    expect(computeLandmarkZoomAltitude(1000)).toBe(400);
    expect(computeLandmarkZoomAltitude(5000)).toBe(2000);
  });

  it("enforces a minimum landmark zoom altitude", () => {
    expect(computeLandmarkZoomAltitude(200)).toBe(250);
    expect(computeLandmarkZoomAltitude(50)).toBe(250);
  });

  it("computes city center from all landmarks", () => {
    const center = computeCityCenter({
      name: "Test City",
      landmarks: [
        { name: "A", lat: 10, lon: 20, altitude: 1000, heading: 0, pitch: -45 },
        { name: "B", lat: 14, lon: 24, altitude: 1000, heading: 0, pitch: -45 },
      ],
    });

    expect(center.lat).toBe(12);
    expect(center.lon).toBe(22);
  });

  it("uses target-centered landmark camera movement", () => {
    const flyTo = vi.fn();
    const flyToBoundingSphere = vi.fn();
    const viewer = {
      camera: {
        flyTo,
        flyToBoundingSphere,
      },
    };

    (globalThis as unknown as { window: Record<string, unknown> }).window = {
      __cesiumViewer: viewer,
    };

    const ok = flyToLandmark(1, 1, 1.5);

    expect(ok).toBe(true);
    expect(flyToBoundingSphere).toHaveBeenCalledTimes(1);
    expect(flyTo).not.toHaveBeenCalled();
  });
});
