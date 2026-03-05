import { useCallback } from "react";
import { Entity, EllipseGraphics } from "resium";
import { Cartesian3, Color, DistanceDisplayCondition } from "cesium";
import { useInternetOutages } from "../../hooks/useInternetOutages";
import { useTrackingStore } from "../../stores/useTrackingStore";

const OUTAGE_COLOR = Color.fromCssColorString("#ff0066");
const FILL_MATERIAL = OUTAGE_COLOR.withAlpha(0.25);
const OUTLINE_COLOR = OUTAGE_COLOR.withAlpha(0.8);
const DISPLAY_CONDITION = new DistanceDisplayCondition(0, 5e7);

function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

export function InternetOutageLayer() {
  const { outages } = useInternetOutages();
  const selectEntity = useTrackingStore((s) => s.selectEntity);

  const handleClick = useCallback(
    (outage: (typeof outages)[number]) => {
      selectEntity({
        id: outage.id,
        type: "internetOutages",
        name: outage.country,
        data: {
          Country: outage.country,
          Score: outage.score,
          Duration: formatDuration(outage.duration),
          Datasource: outage.datasource,
        },
        position: { lat: outage.lat, lon: outage.lon, alt: 0 },
      });
    },
    [selectEntity]
  );

  return (
    <>
      {outages.map((outage) => (
        <Entity
          key={outage.id}
          position={Cartesian3.fromDegrees(outage.lon, outage.lat)}
          name={outage.country}
          onClick={() => handleClick(outage)}
        >
          <EllipseGraphics
            semiMajorAxis={Math.max(50000, outage.score * 5000)}
            semiMinorAxis={Math.max(50000, outage.score * 5000)}
            material={FILL_MATERIAL}
            outline
            outlineColor={OUTLINE_COLOR}
            outlineWidth={1}
            distanceDisplayCondition={DISPLAY_CONDITION}
          />
        </Entity>
      ))}
    </>
  );
}
