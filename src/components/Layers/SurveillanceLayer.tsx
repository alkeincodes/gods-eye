import { useEffect, useRef, useMemo } from "react";
import { useCesium, Entity, PolylineGraphics } from "resium";
import {
  Cartesian3,
  Color,
  BillboardCollection,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import { useSurveillance } from "../../hooks/useSurveillance";
import { useTrackingStore } from "../../stores/useTrackingStore";
import type { SurveillancePass } from "../../types";

function makeSurvIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
  <circle cx="12" cy="12" r="4"/>
  <path d="m15 9-6 6"/>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const SURV_ICON_NORMAL = makeSurvIcon("#ff00ff");
const SURV_ICON_SELECTED = makeSurvIcon("#ffffff");

export function SurveillanceLayer() {
  const { viewer } = useCesium();
  const { passes, setSelectedId } = useSurveillance();
  const selectEntity = useTrackingStore((s) => s.selectEntity);
  const selectedEntity = useTrackingStore((s) => s.selectedEntity);
  const collectionRef = useRef<BillboardCollection | null>(null);
  const dataRef = useRef<SurveillancePass[]>([]);

  dataRef.current = passes;

  const selectedPass = useMemo(() => {
    if (selectedEntity?.type !== "surveillance") return null;
    return passes.find((p) => p.id === selectedEntity.id) ?? null;
  }, [passes, selectedEntity]);

  const trackPositions = useMemo(() => {
    if (!selectedPass || selectedPass.groundTrack.length === 0) return null;
    const coords: number[] = [];
    for (const pt of selectedPass.groundTrack) {
      coords.push(pt.lon, pt.lat, 0);
    }
    return Cartesian3.fromDegreesArrayHeights(coords);
  }, [selectedPass]);

  // Create billboard collection and click handler
  useEffect(() => {
    if (!viewer) return;

    const collection = new BillboardCollection({ scene: viewer.scene });
    viewer.scene.primitives.add(collection);
    collectionRef.current = collection;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
      (event: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(event.position);
        if (defined(picked) && picked.collection === collection) {
          const idx = picked.id as number;
          const pass = dataRef.current[idx];
          if (pass) {
            setSelectedId(pass.id);
            selectEntity({
              id: pass.id,
              type: "surveillance",
              name: pass.name,
              data: {
                Operator: pass.operator,
                Name: pass.name,
                Altitude: `${Math.round(pass.alt)} km`,
                Type: pass.type,
                "NORAD ID": pass.noradId,
              },
              position: { lat: pass.lat, lon: pass.lon, alt: pass.alt * 1000 },
            });
          }
        }
      },
      ScreenSpaceEventType.LEFT_CLICK,
    );

    return () => {
      handler.destroy();
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(collection);
      }
      collectionRef.current = null;
    };
  }, [viewer, selectEntity, setSelectedId]);

  // Update billboard positions
  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection) return;

    const selectedId =
      selectedEntity?.type === "surveillance" ? selectedEntity.id : null;

    // Full rebuild each tick (small number of sats, no interpolation needed)
    collection.removeAll();
    for (let i = 0; i < passes.length; i++) {
      const pass = passes[i];
      collection.add({
        position: Cartesian3.fromDegrees(pass.lon, pass.lat, pass.alt * 1000),
        image: pass.id === selectedId ? SURV_ICON_SELECTED : SURV_ICON_NORMAL,
        width: 20,
        height: 20,
        id: i,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      } as never);
    }
  }, [passes, selectedEntity]);

  return (
    <>
      {trackPositions && trackPositions.length > 1 && (
        <Entity>
          <PolylineGraphics
            positions={trackPositions}
            width={1.5}
            material={Color.MAGENTA.withAlpha(0.6)}
            clampToGround
          />
        </Entity>
      )}
    </>
  );
}
