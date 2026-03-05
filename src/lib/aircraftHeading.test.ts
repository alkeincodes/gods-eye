import { describe, expect, it } from "vitest";
import {
  getAircraftIconRotation,
  getScreenHeadingDegrees,
} from "./aircraftHeading";

describe("getAircraftIconRotation", () => {
  it("applies heading directly with no default icon offset", () => {
    expect(getAircraftIconRotation(0)).toBe(0);
    expect(getAircraftIconRotation(90)).toBe(90);
    expect(getAircraftIconRotation(180)).toBe(180);
    expect(getAircraftIconRotation(270)).toBe(270);
  });

  it("normalizes out-of-range values", () => {
    expect(getAircraftIconRotation(-90)).toBe(270);
    expect(getAircraftIconRotation(450)).toBe(90);
  });

  it("rounds to nearest 10-degree cache bucket", () => {
    expect(getAircraftIconRotation(81)).toBe(80);
    expect(getAircraftIconRotation(84)).toBe(80);
    expect(getAircraftIconRotation(89)).toBe(90);
  });

  it("falls back to 0 for non-finite heading", () => {
    expect(getAircraftIconRotation(Number.NaN)).toBe(0);
    expect(getAircraftIconRotation(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("getScreenHeadingDegrees", () => {
  it("compensates for camera heading in radians", () => {
    const ninetyDeg = Math.PI / 2;
    expect(getScreenHeadingDegrees(132, ninetyDeg)).toBe(222);
  });

  it("normalizes wrapped values into [0, 360)", () => {
    const twoSeventyDeg = (3 * Math.PI) / 2;
    expect(getScreenHeadingDegrees(10, twoSeventyDeg)).toBe(280);
  });

  it("falls back safely for non-finite camera heading", () => {
    expect(getScreenHeadingDegrees(90, Number.NaN)).toBe(90);
  });
});
