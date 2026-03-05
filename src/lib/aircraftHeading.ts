const FULL_CIRCLE_DEGREES = 360;
const DEFAULT_BUCKET_SIZE = 10;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeHeadingDegrees(heading: number): number {
  if (!Number.isFinite(heading)) return 0;
  return ((heading % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
}

export function getScreenHeadingDegrees(
  headingDegrees: number,
  cameraHeadingRadians: number,
): number {
  if (!Number.isFinite(headingDegrees)) return 0;
  if (!Number.isFinite(cameraHeadingRadians)) {
    return normalizeHeadingDegrees(headingDegrees);
  }

  const cameraDeg = cameraHeadingRadians * RAD_TO_DEG;
  return normalizeHeadingDegrees(headingDegrees + cameraDeg);
}

export function getAircraftIconRotation(
  heading: number,
  bucketSize: number = DEFAULT_BUCKET_SIZE,
): number {
  if (!Number.isFinite(heading)) return 0;
  const normalized = normalizeHeadingDegrees(heading);
  const bucket = Math.round(normalized / bucketSize) * bucketSize;
  return bucket % FULL_CIRCLE_DEGREES;
}
