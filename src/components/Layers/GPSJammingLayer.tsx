import { useCallback } from "react";
import { Entity, EllipseGraphics } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition } from "cesium";
import { useGPSJamming } from "../../hooks/useGPSJamming";
import { useTrackingStore } from "../../stores/useTrackingStore";
import { H3_RES4_RADIUS_M } from "../../lib/h3";

export function GPSJammingLayer() {
  const { zones, loading } = useGPSJamming();
  const selectEntity = useTrackingStore((s) => s.selectEntity);

  const handleClick = useCallback(
    (zone: (typeof zones)[number]) => {
      selectEntity({
        id: zone.id,
        type: "gpsJamming",
        name: `GPS Jamming - ${zone.h3Index}`,
        position: { lat: zone.lat, lon: zone.lon, alt: 0 },
        data: {
          "H3 Index": zone.h3Index,
          "Good Count": zone.countGood,
          "Bad Count": zone.countBad,
          "Interference": `${(zone.ratio * 100).toFixed(1)}%`,
        },
      });
    },
    [selectEntity],
  );

  if (loading || zones.length === 0) return null;

  return (
    <>
      {zones.map((zone) => {
        const fillColor = Color.fromCssColorString("#ff3333").withAlpha(
          0.1 + zone.ratio * 0.5,
        );
        const outlineColor = Color.fromCssColorString("#ff3333").withAlpha(
          0.6 + zone.ratio * 0.4,
        );

        return (
          <Entity
            key={zone.id}
            position={Cartesian3.fromDegrees(zone.lon, zone.lat)}
            name={`GPS Jamming - ${zone.h3Index}`}
            onClick={() => handleClick(zone)}
          >
            <EllipseGraphics
              semiMajorAxis={H3_RES4_RADIUS_M}
              semiMinorAxis={H3_RES4_RADIUS_M}
              material={fillColor}
              outline
              outlineColor={outlineColor}
              outlineWidth={1}
              distanceDisplayCondition={
                new DistanceDisplayCondition(0, 20_000_000)
              }
            />
          </Entity>
        );
      })}
    </>
  );
}
