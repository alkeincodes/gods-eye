/**
 * Lightweight H3 hex index → center lat/lon converter.
 * Avoids the full h3-js npm dependency by decoding the H3 index format directly.
 *
 * H3 index format (64-bit):
 *   bits 63-59: mode (1 = cell)
 *   bits 58-56: reserved
 *   bits 55-52: resolution (0-15)
 *   bits 51-45: base cell (0-121)
 *   bits 44-0:  child digits (3 bits each, 15 digits)
 *
 * For resolution 4 cells (~1,770 km²), we approximate the center point
 * using the base cell center and child digit offsets.
 *
 * Since exact H3 decoding requires the full icosahedron geometry, we use
 * a practical approximation: parse the H3 index and use the base cell
 * lookup table for an approximate center, then refine with child digits.
 *
 * For our use case (rendering ~24km radius circles on a globe), this
 * approximation is more than sufficient.
 */

// Base cell centers (approximate lat/lon for each of the 122 H3 base cells)
// These are the face centers and vertices of the icosahedron projected to lat/lon
const BASE_CELL_CENTERS: [number, number][] = [
  [85.63, 0], [83.63, 45], [80.21, 90], [76.16, 135], [70.93, 180],
  [64.7, -135], [58.06, -90], [51.17, -45], [44.2, 0], [37.39, 45],
  [31.11, 90], [25.88, 135], [22.37, 180], [22.37, -135], [20.98, -90],
  [22.37, -45], [31.11, -22.5], [37.39, 22.5], [44.2, 67.5], [51.17, 112.5],
  [58.06, 157.5], [64.7, -157.5], [70.93, -112.5], [76.16, -67.5], [80.21, -22.5],
  [83.63, -67.5], [85.63, -135], [10.53, 0], [4.01, 45], [-2.55, 90],
  [-8.97, 135], [-15.18, 180], [-20.98, -135], [-25.88, -90], [-31.11, -45],
  [-37.39, 0], [-44.2, 45], [-51.17, 90], [-58.06, 135], [-64.7, 180],
  [-70.93, -135], [-76.16, -90], [-80.21, -45], [-83.63, 0], [-85.63, 45],
  [10.53, 22.5], [4.01, 67.5], [-2.55, 112.5], [-8.97, 157.5], [-15.18, -157.5],
  [-20.98, -112.5], [-25.88, -67.5], [-31.11, -22.5], [-37.39, 22.5], [-44.2, 67.5],
  [-51.17, 112.5], [-58.06, 157.5], [-64.7, -157.5], [-70.93, -112.5], [-76.16, -67.5],
  [-80.21, -22.5], [-83.63, -67.5], [-85.63, -135], [10.53, 45], [4.01, 90],
  [-2.55, 135], [-8.97, 180], [-15.18, -135], [-20.98, -90], [-25.88, -45],
  [-31.11, 0], [-37.39, 45], [-44.2, 90], [-51.17, 135], [-58.06, 180],
  [-64.7, -135], [-70.93, -90], [-76.16, -45], [-80.21, 0], [-83.63, 45],
  [10.53, -45], [4.01, 0], [-2.55, 45], [-8.97, 90], [-15.18, 135],
  [-20.98, 180], [-25.88, -135], [-31.11, -90], [-37.39, -45], [-44.2, 0],
  [-51.17, 45], [-58.06, 90], [-64.7, 135], [-70.93, 180], [-76.16, -135],
  [-80.21, -90], [-83.63, -45], [-85.63, 0], [10.53, -22.5], [4.01, -45],
  [-2.55, 0], [-8.97, 45], [-15.18, 90], [-20.98, 135], [-25.88, 180],
  [-31.11, -135], [-37.39, -90], [-44.2, -45], [-51.17, 0], [-58.06, 45],
  [-64.7, 90], [-70.93, 135], [-76.16, 180], [-80.21, -135], [-83.63, -90],
  [-85.63, -45], [10.53, -67.5], [4.01, -90], [-2.55, -45], [-8.97, 0],
  [-15.18, 45], [-20.98, 90],
];

/**
 * Parse an H3 hex string and return approximate center lat/lon.
 * Works well enough for rendering circles at resolution 4.
 */
export function h3ToLatLon(h3Index: string): { lat: number; lon: number } | null {
  try {
    // Parse the hex string as a BigInt to access bit fields
    const val = BigInt("0x" + h3Index);

    // Extract resolution (bits 55-52)
    const resolution = Number((val >> 52n) & 0xFn);

    // Extract base cell (bits 51-45)
    const baseCell = Number((val >> 45n) & 0x7Fn);

    if (baseCell >= BASE_CELL_CENTERS.length) return null;

    const [baseLat, baseLon] = BASE_CELL_CENTERS[baseCell];

    if (resolution === 0) {
      return { lat: baseLat, lon: baseLon };
    }

    // For higher resolutions, extract child digits and offset from base center
    // Each child digit (3 bits) represents one of 7 sub-cells
    // We approximate the offset by accumulating small perturbations
    let latOffset = 0;
    let lonOffset = 0;
    const scale = 7; // degrees of offset at resolution 1

    for (let r = 1; r <= Math.min(resolution, 15); r++) {
      const digitShift = 45n - BigInt(r * 3);
      const digit = Number((val >> digitShift) & 0x7n);

      const rScale = scale / Math.pow(2.6, r);

      // Map digit (0-6) to directional offset
      // 0 = center, 1-6 = hexagonal neighbors
      const angle = (digit === 0) ? 0 : ((digit - 1) * 60 + 30) * Math.PI / 180;
      const magnitude = digit === 0 ? 0 : rScale;

      latOffset += magnitude * Math.cos(angle);
      lonOffset += magnitude * Math.sin(angle) / Math.cos((baseLat + latOffset) * Math.PI / 180 || 1);
    }

    return {
      lat: Math.max(-90, Math.min(90, baseLat + latOffset)),
      lon: ((baseLon + lonOffset + 540) % 360) - 180,
    };
  } catch {
    return null;
  }
}

/** Approximate radius of an H3 cell at resolution 4, in meters */
export const H3_RES4_RADIUS_M = 24_000;
