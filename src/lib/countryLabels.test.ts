import { describe, expect, it } from "vitest";
import { COUNTRY_CENTROIDS } from "./countries";
import { buildCountryLabels } from "./countryLabels";

describe("buildCountryLabels", () => {
  it("returns one label per known centroid", () => {
    const labels = buildCountryLabels();
    expect(labels).toHaveLength(Object.keys(COUNTRY_CENTROIDS).length);
  });

  it("includes expected coordinates for known country codes", () => {
    const labels = buildCountryLabels();
    const us = labels.find((l) => l.code === "US");
    expect(us).toBeDefined();
    expect(us?.lat).toBe(COUNTRY_CENTROIDS.US.lat);
    expect(us?.lon).toBe(COUNTRY_CENTROIDS.US.lon);
    expect(us?.name.length).toBeGreaterThan(0);
  });

  it("sorts labels by display name for stable render order", () => {
    const labels = buildCountryLabels();
    const names = labels.map((l) => l.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

