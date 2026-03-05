import { useState, useCallback } from "react";
import { Entity, BillboardGraphics } from "resium";
import {
  Cartesian3,
  NearFarScalar,
  DistanceDisplayCondition,
} from "cesium";
import { useCCTV } from "../../hooks/useCCTV";
import { useTrackingStore } from "../../stores/useTrackingStore";

function createCameraIcon(selected: boolean): string {
  const color = selected ? "#ffffff" : "#ffff00";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function CCTVLayer() {
  const { cameras } = useCCTV();
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const selectEntity = useTrackingStore((s) => s.selectEntity);

  const handleClick = useCallback(
    (cam: (typeof cameras)[0]) => {
      setSelectedCam(cam.id);
      selectEntity({
        type: "cctv",
        id: cam.id,
        name: cam.name,
        position: { lat: cam.lat, lon: cam.lon, alt: 0 },
        data: {
          Camera: cam.name,
          City: cam.city,
          Feed: cam.imageUrl,
        },
      });
    },
    [selectEntity],
  );

  return (
    <>
      {cameras.map((cam) => (
        <Entity
          key={cam.id}
          position={Cartesian3.fromDegrees(cam.lon, cam.lat, 50)}
          name={cam.name}
          onClick={() => handleClick(cam)}
        >
          <BillboardGraphics
            image={createCameraIcon(selectedCam === cam.id)}
            width={16}
            height={16}
            scaleByDistance={new NearFarScalar(1e3, 1.5, 1e6, 0.3)}
            distanceDisplayCondition={
              new DistanceDisplayCondition(0, 5e5)
            }
          />
        </Entity>
      ))}
    </>
  );
}
