import { useEffect, useRef, useMemo } from "react";
import { useCesium } from "resium";
import { Entity, PolylineGraphics } from "resium";
import {
  Cartesian3,
  Color,
  BillboardCollection,
  HeadingPitchRange,
  Matrix4,
  Math as CesiumMath,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import { useSatellites } from "../../hooks/useSatellites";
import { useTrackingStore, entityScreenPos } from "../../stores/useTrackingStore";
import { computeOrbitPath } from "../../lib/satellites";
import { flyToEntity } from "../../lib/cameraNavigation";
import type { SatelliteData } from "../../types";

// Lucide "Satellite" icon — two variants: normal (#00ff88) and selected (#ffffff)
function makeSatIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    <path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5"/>
    <path d="M16.5 7.5 19 5"/>
    <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5"/>
    <path d="M9 21a6 6 0 0 0-6-6"/>
    <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const SAT_ICON_NORMAL = makeSatIcon("#00ff88");
const SAT_ICON_SELECTED = makeSatIcon("#ffffff");

interface SatPosition {
  lat: number;
  lon: number;
  alt: number;
}

export function SatelliteLayer() {
  const { viewer } = useCesium();
  const { satellites } = useSatellites();
  const selectEntity = useTrackingStore((s) => s.selectEntity);
  const selectedEntity = useTrackingStore((s) => s.selectedEntity);
  const collectionRef = useRef<BillboardCollection | null>(null);
  const wasTrackingRef = useRef(false);
  const dataRef = useRef<SatelliteData[]>([]);

  // Keyframe interpolation refs
  const prevPositionsRef = useRef<SatPosition[]>([]);
  const currPositionsRef = useRef<SatPosition[]>([]);
  const lerpTimeRef = useRef(0);

  dataRef.current = satellites;

  const selectedSat = useMemo(() => {
    if (selectedEntity?.type !== "satellites") return null;
    return satellites.find((s) => s.id === selectedEntity.id) || null;
  }, [selectedEntity, satellites]);

  const orbitPath = useMemo(() => {
    if (!selectedSat) return null;
    const path = computeOrbitPath(selectedSat, new Date());
    return path.map((p) => Cartesian3.fromDegrees(p.lon, p.lat, p.alt * 1000));
  }, [selectedSat]);

  // Create billboard collection once
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
          const sat = dataRef.current[idx];
          if (sat) {
            selectEntity({
              type: "satellites",
              id: sat.id,
              name: sat.name,
              position: { lat: sat.lat, lon: sat.lon, alt: sat.alt },
              data: {
                "NORAD ID": sat.id,
                Altitude: `${sat.alt.toFixed(1)} km`,
                Latitude: `${sat.lat.toFixed(4)}°`,
                Longitude: `${sat.lon.toFixed(4)}°`,
              },
            });
            flyToEntity(sat.lat, sat.lon, sat.alt, "satellites");
          }
        }
      },
      ScreenSpaceEventType.LEFT_CLICK,
    );

    return () => {
      handler.destroy();
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(collection);
        if (wasTrackingRef.current) {
          viewer.camera.lookAtTransform(Matrix4.IDENTITY);
          wasTrackingRef.current = false;
        }
      }
      collectionRef.current = null;
    };
  }, [viewer, selectEntity]);

  // Capture keyframes and update icons when satellites change
  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection) return;

    const selectedId =
      selectedEntity?.type === "satellites" ? selectedEntity.id : null;

    // Shift interpolation keyframes: prev ← curr, curr ← new
    const newPositions = satellites.map((s) => ({
      lat: s.lat,
      lon: s.lon,
      alt: s.alt,
    }));

    prevPositionsRef.current =
      currPositionsRef.current.length > 0
        ? currPositionsRef.current
        : newPositions;
    currPositionsRef.current = newPositions;
    lerpTimeRef.current = performance.now();

    if (collection.length === satellites.length && satellites.length > 0) {
      // Same count: only update images (rAF handles positions)
      for (let i = 0; i < satellites.length; i++) {
        const sat = satellites[i];
        collection.get(i).image =
          sat.id === selectedId ? SAT_ICON_SELECTED : SAT_ICON_NORMAL;
      }
    } else {
      // Count changed: full rebuild
      collection.removeAll();
      for (let i = 0; i < satellites.length; i++) {
        const sat = satellites[i];
        collection.add({
          position: Cartesian3.fromDegrees(sat.lon, sat.lat, sat.alt * 1000),
          image: sat.id === selectedId ? SAT_ICON_SELECTED : SAT_ICON_NORMAL,
          width: 10,
          height: 10,
          id: i,
        } as never);
      }
      // First load: prev = curr to avoid a backward jump
      prevPositionsRef.current = newPositions;
    }
  }, [satellites, selectedEntity]);

  // rAF interpolation loop — smoothly lerps between 1s keyframes + tracking
  useEffect(() => {
    let rafId: number;
    let running = true;

    const animate = () => {
      if (!running) return;

      const collection = collectionRef.current;
      const prev = prevPositionsRef.current;
      const curr = currPositionsRef.current;

      if (
        collection &&
        prev.length > 0 &&
        prev.length === curr.length &&
        collection.length === curr.length
      ) {
        const elapsed = performance.now() - lerpTimeRef.current;
        const t = Math.min(elapsed / 1000, 1); // 0→1 over 1 second

        for (let i = 0; i < collection.length; i++) {
          const p = prev[i];
          const c = curr[i];
          const lat = p.lat + (c.lat - p.lat) * t;
          const lon = p.lon + (c.lon - p.lon) * t;
          const alt = p.alt + (c.alt - p.alt) * t;
          collection.get(i).position = Cartesian3.fromDegrees(
            lon,
            lat,
            alt * 1000,
          );
        }

        // Camera follow + screen position for satellites
        const { selectedEntity: selEnt, tracking: isTracking } =
          useTrackingStore.getState();
        if (selEnt?.type === "satellites" && viewer) {
          const idx = dataRef.current.findIndex((s) => s.id === selEnt.id);
          if (idx >= 0 && idx < collection.length) {
            const pos = collection.get(idx).position;

            // Project to screen for the floating tooltip (mutable — no React re-render)
            const screenPos = SceneTransforms.worldToWindowCoordinates(
              viewer.scene,
              pos,
            );
            if (screenPos) {
              entityScreenPos.x = screenPos.x;
              entityScreenPos.y = screenPos.y;
              entityScreenPos.valid = true;
            }

            if (isTracking) {
              viewer.camera.lookAt(
                pos,
                new HeadingPitchRange(
                  viewer.camera.heading,
                  CesiumMath.toRadians(-90),
                  500_000,
                ),
              );
              wasTrackingRef.current = true;
            } else if (wasTrackingRef.current) {
              viewer.camera.lookAtTransform(Matrix4.IDENTITY);
              wasTrackingRef.current = false;
            }
          }
        } else if (wasTrackingRef.current && viewer) {
          viewer.camera.lookAtTransform(Matrix4.IDENTITY);
          wasTrackingRef.current = false;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, [viewer]);

  return (
    <>
      {orbitPath && orbitPath.length > 1 && (
        <Entity>
          <PolylineGraphics
            positions={orbitPath}
            width={1}
            material={Color.fromCssColorString("#00ff8844")}
          />
        </Entity>
      )}
    </>
  );
}
