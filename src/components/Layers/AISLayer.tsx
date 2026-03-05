import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  Cartesian3,
  BillboardCollection,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import { useAIS } from "../../hooks/useAIS";
import { useTrackingStore } from "../../stores/useTrackingStore";
import type { AISVessel } from "../../types";

const TYPE_COLORS: Record<AISVessel["type"], string> = {
  tanker: "#00ddff",
  cargo: "#ffffff",
  naval: "#ff4444",
  fishing: "#ffdd00",
};

function createShipSVG(color: string, heading: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(${heading}, 12, 12)"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v-3"/></g></svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

const iconCache = new Map<string, string>();

function getShipIcon(color: string, heading: number): string {
  const roundedHeading = Math.round(heading / 5) * 5;
  const key = `${color}-${roundedHeading}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = createShipSVG(color, roundedHeading);
    iconCache.set(key, icon);
  }
  return icon;
}

export function AISLayer() {
  const { viewer } = useCesium();
  const { vessels } = useAIS();
  const selectEntity = useTrackingStore((s) => s.selectEntity);
  const collectionRef = useRef<BillboardCollection | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const vesselsRef = useRef<AISVessel[]>([]);

  vesselsRef.current = vessels;

  useEffect(() => {
    if (!viewer) return;

    const collection = new BillboardCollection({ scene: viewer.scene });
    viewer.scene.primitives.add(collection);
    collectionRef.current = collection;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(event.position);
      if (defined(picked) && picked.collection === collectionRef.current) {
        const index = picked.id as number;
        const vessel = vesselsRef.current[index];
        if (vessel) {
          selectEntity({
            id: vessel.mmsi,
            type: "ais",
            name: vessel.name,
            position: { lat: vessel.lat, lon: vessel.lon, alt: 0 },
            data: {
              "Vessel Name": vessel.name,
              Type: vessel.type.charAt(0).toUpperCase() + vessel.type.slice(1),
              Flag: vessel.flag,
              Speed: `${vessel.speed.toFixed(1)} kn`,
              Heading: `${vessel.heading.toFixed(0)}°`,
              Destination: vessel.destination,
            },
          });
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      handlerRef.current = null;
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.primitives.remove(collection);
      }
      collectionRef.current = null;
    };
  }, [viewer, selectEntity]);

  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection || !viewer) return;

    collection.removeAll();

    const camera = viewer.scene.camera;
    const cameraHeading = (camera.heading * 180) / Math.PI;

    vessels.forEach((vessel, index) => {
      const color = TYPE_COLORS[vessel.type];
      const visualHeading = vessel.heading - cameraHeading;
      const icon = getShipIcon(color, visualHeading);

      collection.add({
        position: Cartesian3.fromDegrees(vessel.lon, vessel.lat, 0),
        image: icon,
        width: 24,
        height: 24,
        id: index,
      });
    });
  }, [vessels, viewer]);

  return null;
}
