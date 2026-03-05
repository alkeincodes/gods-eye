import { useCallback } from "react";
import { Entity, PolygonGraphics } from "resium";
import { Cartesian3, Color, PolygonHierarchy } from "cesium";
import { useAirspace } from "../../hooks/useAirspace";
import { useTrackingStore } from "../../stores/useTrackingStore";
import type { AirspaceZone } from "../../types";

const ZONE_COLORS: Record<AirspaceZone["type"], { fill: Color; outline: Color }> = {
  conflict: {
    fill: Color.fromCssColorString("#ff0000").withAlpha(0.15),
    outline: Color.fromCssColorString("#ff0000").withAlpha(0.6),
  },
  restricted: {
    fill: Color.fromCssColorString("#ff6600").withAlpha(0.15),
    outline: Color.fromCssColorString("#ff6600").withAlpha(0.6),
  },
  adiz: {
    fill: Color.fromCssColorString("#ffcc00").withAlpha(0.15),
    outline: Color.fromCssColorString("#ffcc00").withAlpha(0.6),
  },
};

export function AirspaceLayer() {
  const { zones } = useAirspace();
  const selectEntity = useTrackingStore((s) => s.selectEntity);

  const handleClick = useCallback(
    (zone: AirspaceZone) => {
      const center = zone.polygon.reduce(
        (acc, [lon, lat]) => ({ lat: acc.lat + lat / zone.polygon.length, lon: acc.lon + lon / zone.polygon.length }),
        { lat: 0, lon: 0 },
      );
      selectEntity({
        id: zone.id,
        type: "airspace",
        name: zone.name,
        position: { lat: center.lat, lon: center.lon, alt: 0 },
        data: {
          Type: zone.type.charAt(0).toUpperCase() + zone.type.slice(1),
          Description: zone.description,
        },
      });
    },
    [selectEntity]
  );

  return (
    <>
      {zones.map((zone) => {
        const colors = ZONE_COLORS[zone.type];
        const positions = Cartesian3.fromDegreesArray(zone.polygon.flat());
        const hierarchy = new PolygonHierarchy(positions);

        return (
          <Entity
            key={zone.id}
            name={zone.name}
            description={zone.description}
            onClick={() => handleClick(zone)}
          >
            <PolygonGraphics
              hierarchy={hierarchy}
              material={colors.fill}
              outline
              outlineColor={colors.outline}
              outlineWidth={2}
            />
          </Entity>
        );
      })}
    </>
  );
}
