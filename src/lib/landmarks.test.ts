import { describe, expect, it } from "vitest";
import { CITIES } from "./landmarks";

describe("landmarks dataset", () => {
  it("includes Iran, Dubai, and Israel location groups", () => {
    const names = new Set(CITIES.map((city) => city.name));
    expect(names.has("Iran")).toBe(true);
    expect(names.has("Dubai")).toBe(true);
    expect(names.has("Israel")).toBe(true);
  });

  it("provides at least 5 landmarks for new location groups", () => {
    const required = ["Iran", "Dubai", "Israel"];

    for (const name of required) {
      const city = CITIES.find((c) => c.name === name);
      expect(city).toBeDefined();
      expect(city?.landmarks.length).toBeGreaterThanOrEqual(5);
    }
  });
});
