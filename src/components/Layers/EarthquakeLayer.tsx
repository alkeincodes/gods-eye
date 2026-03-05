import { useCallback } from "react";
import { Entity, EllipseGraphics } from "resium";
import {
  Cartesian3,
  Color,
  DistanceDisplayCondition,
} from "cesium";
import { useEarthquakes } from "../../hooks/useEarthquakes";
import { useTrackingStore } from "../../stores/useTrackingStore";

function magnitudeToRadius(mag: number): number {
  // Scale: M2 = 20km, M5 = 100km, M7+ = 300km
  return Math.max(20000, Math.pow(10, mag / 2) * 500);
}

function depthToColor(depth: number): Color {
  // Shallow (0-70km) = red, Intermediate (70-300) = orange, Deep (300+) = blue
  if (depth < 70) return Color.fromCssColorString("#ff4444");
  if (depth < 300) return Color.fromCssColorString("#ff8800");
  return Color.fromCssColorString("#4488ff");
}

export function EarthquakeLayer() {
  const { earthquakes } = useEarthquakes();
  const selectEntity = useTrackingStore((s) => s.selectEntity);

  const handleClick = useCallback(
    (eq: (typeof earthquakes)[0]) => {
      selectEntity({
        type: "earthquakes",
        id: eq.id,
        name: `M${eq.magnitude} - ${eq.place}`,
        position: { lat: eq.lat, lon: eq.lon, alt: 0 },
        data: {
          Magnitude: eq.magnitude.toFixed(1),
          Depth: `${eq.depth.toFixed(1)} km`,
          Location: eq.place,
          Time: new Date(eq.time).toISOString(),
        },
      });
    },
    [selectEntity],
  );

  return (
    <>
      {earthquakes.map((eq) => {
        const radius = magnitudeToRadius(eq.magnitude);
        const color = depthToColor(eq.depth);

        return (
          <Entity
            key={eq.id}
            position={Cartesian3.fromDegrees(eq.lon, eq.lat)}
            name={`M${eq.magnitude} - ${eq.place}`}
            onClick={() => handleClick(eq)}
          >
            <EllipseGraphics
              semiMajorAxis={radius}
              semiMinorAxis={radius}
              material={color.withAlpha(0.3)}
              outline
              outlineColor={color.withAlpha(0.8)}
              outlineWidth={1}
              distanceDisplayCondition={
                new DistanceDisplayCondition(0, 5e7)
              }
            />
          </Entity>
        );
      })}
    </>
  );
}
