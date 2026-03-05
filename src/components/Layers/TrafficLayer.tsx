import { Entity, PolylineGraphics } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition } from "cesium";
import { useTraffic } from "../../hooks/useTraffic";

// Default bbox: DC metro area
const DEFAULT_BBOX = {
  south: 38.8,
  west: -77.2,
  north: 39.0,
  east: -76.9,
};

export function TrafficLayer() {
  const { segments } = useTraffic(DEFAULT_BBOX);

  return (
    <>
      {segments.map((seg) => (
        <Entity key={seg.id}>
          <PolylineGraphics
            positions={seg.coordinates.map(([lon, lat]) =>
              Cartesian3.fromDegrees(lon, lat, 10),
            )}
            width={2}
            material={Color.fromCssColorString("#aa44ff").withAlpha(0.6)}
            distanceDisplayCondition={
              new DistanceDisplayCondition(0, 2e5)
            }
          />
        </Entity>
      ))}
    </>
  );
}
