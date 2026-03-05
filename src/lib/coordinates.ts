/**
 * Convert decimal degrees to DMS (Degrees Minutes Seconds) string.
 */
export function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = ((mFloat - m) * 60).toFixed(1);

  const dir = isLat ? (decimal >= 0 ? "N" : "S") : decimal >= 0 ? "E" : "W";
  return `${d}°${m.toString().padStart(2, "0")}'${s.padStart(4, "0")}"${dir}`;
}

/**
 * Estimate Ground Sample Distance from camera altitude in meters.
 * Rough approximation assuming nadir view.
 */
export function estimateGSD(altMeters: number): string {
  // Very rough: GSD ~ alt * sensor_pixel / focal_length
  // For display purposes, use simplified model
  const gsd = altMeters * 0.001; // ~1mm per meter alt
  if (gsd < 1) return gsd.toFixed(2);
  if (gsd < 100) return gsd.toFixed(1);
  return Math.round(gsd).toString();
}

/**
 * Estimate sun elevation angle based on UTC time (very simplified).
 */
export function estimateSunAngle(): number {
  const now = new Date();
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  // Simple sine approximation: peak at noon UTC
  return Math.round(90 * Math.sin(((hours - 6) / 12) * Math.PI));
}
