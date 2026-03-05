import { describe, expect, it } from "vitest";
import { bearingBetweenPoints, resolveHeadingFromMotion } from "./motionHeading";

describe("bearingBetweenPoints", () => {
  it("returns cardinal bearings", () => {
    expect(bearingBetweenPoints({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBe(0);
    expect(bearingBetweenPoints({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBe(90);
    expect(bearingBetweenPoints({ lat: 1, lon: 0 }, { lat: 0, lon: 0 })).toBe(180);
    expect(bearingBetweenPoints({ lat: 0, lon: 1 }, { lat: 0, lon: 0 })).toBe(270);
  });

  it("returns null when points are identical", () => {
    expect(bearingBetweenPoints({ lat: 10, lon: 20 }, { lat: 10, lon: 20 })).toBeNull();
  });

});

describe("resolveHeadingFromMotion", () => {
  it("uses fallback when no previous point exists", () => {
    expect(resolveHeadingFromMotion(null, { lat: 10, lon: 20 }, 211)).toBe(211);
  });

  it("uses derived bearing when motion is meaningful", () => {
    const heading = resolveHeadingFromMotion(
      { lat: 10, lon: 20 },
      { lat: 10.01, lon: 20 },
      211,
    );
    expect(Math.round(heading)).toBe(0);
  });

  it("keeps fallback when movement is too small", () => {
    const heading = resolveHeadingFromMotion(
      { lat: 10, lon: 20 },
      { lat: 10.0001, lon: 20 },
      132,
    );
    expect(heading).toBe(132);
  });
});
