import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  Cartesian3,
  BillboardCollection,
  HeadingPitchRange,
  Matrix4,
  Math as CesiumMath,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import { useFlights } from "../../hooks/useFlights";
import { useTrackingStore, entityScreenPos } from "../../stores/useTrackingStore";
import { usePlaybackStore } from "../../stores/usePlaybackStore";
import { flyToEntity } from "../../lib/cameraNavigation";
import {
  getAircraftIconRotation,
  getScreenHeadingDegrees,
} from "../../lib/aircraftHeading";
import { resolveHeadingFromMotion } from "../../lib/motionHeading";
import type { FlightData } from "../../types";

// Upward-oriented plane icon — cached per heading bucket + color
const ICON_CACHE = new Map<string, string>();

function getPlaneIcon(heading: number, selected: boolean): string {
  const rotation = getAircraftIconRotation(heading);
  const color = selected ? "#ffffff" : "#00aaff";
  const key = `${rotation}-${color}`;

  let icon = ICON_CACHE.get(key);
  if (!icon) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_1871_2)">
        <g transform="rotate(${rotation}, 12, 12)">
          <path d="M20.6212 13.8778L14.0617 9.67964V5.08794C14.0617 3.12007 13.0777 1.48018 12.0938 1.1522C11.1098 1.48018 10.1259 3.12007 10.1259 5.08794V9.67964L3.56635 13.8778C3.17277 14.1401 3.04158 14.5337 3.17277 14.9273L3.30397 15.4521C3.50075 15.9112 3.89433 16.1736 4.3535 16.108L10.1259 14.9273L10.7819 18.2071L8.814 20.1749V21.4869L12.0938 20.8309L15.3736 21.4869V20.1749L13.4057 18.2071L14.0617 14.9273L19.8341 16.108C20.2932 16.1736 20.6868 15.9112 20.8836 15.4521L21.0804 14.9929C21.146 14.5337 21.0148 14.1401 20.6212 13.8778Z" fill="${color}" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_1871_2">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>`;
    icon = `data:image/svg+xml;base64,${btoa(svg)}`;
    ICON_CACHE.set(key, icon);
  }
  return icon;
}

export function FlightLayer() {
  const { viewer } = useCesium();
  const { flights } = useFlights();
  const selectEntity = useTrackingStore((s) => s.selectEntity);
  const selectedEntity = useTrackingStore((s) => s.selectedEntity);
  const collectionRef = useRef<BillboardCollection | null>(null);
  const flightsRef = useRef<FlightData[]>([]);
  const previousPositionsRef = useRef<Map<string, { lat: number; lon: number }>>(
    new Map(),
  );
  const displayHeadingsRef = useRef<Map<string, number>>(new Map());
  const lastCameraHeadingRef = useRef(Number.NaN);
  const wasTrackingRef = useRef(false);
  const playbackMode = usePlaybackStore((s) => s.mode);

  flightsRef.current = flights;

  // Create billboard collection + camera heading listener
  useEffect(() => {
    if (!viewer) return;

    const collection = new BillboardCollection({ scene: viewer.scene });
    viewer.scene.primitives.add(collection);
    collectionRef.current = collection;

    // Compensate icon heading for camera heading on every render frame + tracking
    const removePreRender = viewer.scene.preRender.addEventListener(() => {
      const cameraHeading = viewer.camera.heading;
      if (cameraHeading !== lastCameraHeadingRef.current && collection.length > 0) {
        lastCameraHeadingRef.current = cameraHeading;
        const { selectedEntity: currentSelected } = useTrackingStore.getState();
        const selectedId =
          currentSelected?.type === "flights" ? currentSelected.id : null;

        for (let i = 0; i < collection.length; i++) {
          const f = flightsRef.current[i];
          const billboard = collection.get(i);
          if (!f || !billboard) continue;
          const heading = displayHeadingsRef.current.get(f.icao24) ?? f.heading;
          const screenHeading = getScreenHeadingDegrees(heading, cameraHeading);
          billboard.image = getPlaneIcon(screenHeading, f.icao24 === selectedId);
        }
      }

      // Camera follow + screen position update
      const { selectedEntity: selEnt, tracking: isTracking } =
        useTrackingStore.getState();
      if (selEnt?.type !== "flights") return;

      const idx = flightsRef.current.findIndex((f) => f.icao24 === selEnt.id);
      if (idx < 0 || idx >= collection.length) return;

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

      // Camera lock — top-down view
      if (isTracking) {
        const altMeters = flightsRef.current[idx]?.altitude ?? 5000;
        const range = Math.max(5000, altMeters * 2);
        viewer.camera.lookAt(
          pos,
          new HeadingPitchRange(
            viewer.camera.heading,
            CesiumMath.toRadians(-90),
            range,
          ),
        );
        wasTrackingRef.current = true;
      } else if (wasTrackingRef.current) {
        viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        wasTrackingRef.current = false;
      }
    });

    // Click handler
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
      (event: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(event.position);
        if (defined(picked) && picked.collection === collection) {
          const idx = picked.id as number;
          const flight = flightsRef.current[idx];
          if (flight) {
            selectEntity({
              type: "flights",
              id: flight.icao24,
              name: flight.callsign || flight.icao24,
              position: {
                lat: flight.lat,
                lon: flight.lon,
                alt: flight.altitude,
              },
              data: {
                Callsign: flight.callsign || "N/A",
                ICAO24: flight.icao24,
                Country: flight.originCountry,
                Altitude: `${Math.round(flight.altitude)} m`,
                Speed: `${Math.round(flight.velocity)} m/s`,
                Heading: `${Math.round(flight.heading)}°`,
              },
            });
            flyToEntity(flight.lat, flight.lon, flight.altitude, "flights");
          }
        }
      },
      ScreenSpaceEventType.LEFT_CLICK,
    );

    return () => {
      removePreRender();
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

  // Update billboards when flights change
  useEffect(() => {
    const collection = collectionRef.current;
    if (!collection) return;

    collection.removeAll();

    const selectedId =
      selectedEntity?.type === "flights" ? selectedEntity.id : null;
    const cameraHeading = viewer ? viewer.camera.heading : 0;
    const prevPositions = previousPositionsRef.current;
    const nextPositions = new Map<string, { lat: number; lon: number }>();
    const nextDisplayHeadings = new Map<string, number>();

    for (let i = 0; i < flights.length; i++) {
      const f = flights[i];
      const previousPoint = prevPositions.get(f.icao24) ?? null;
      const stableFallback = displayHeadingsRef.current.get(f.icao24) ?? f.heading;
      const resolvedHeading = resolveHeadingFromMotion(
        previousPoint,
        { lat: f.lat, lon: f.lon },
        stableFallback,
      );
      nextDisplayHeadings.set(f.icao24, resolvedHeading);
      nextPositions.set(f.icao24, { lat: f.lat, lon: f.lon });

      collection.add({
        position: Cartesian3.fromDegrees(f.lon, f.lat, f.altitude),
        image: getPlaneIcon(
          getScreenHeadingDegrees(resolvedHeading, cameraHeading),
          f.icao24 === selectedId,
        ),
        rotation: 0,
        width: 16,
        height: 16,
        id: i,
        distanceDisplayCondition: { near: 0, far: 2e7 },
      } as never);
    }

    previousPositionsRef.current = nextPositions;
    displayHeadingsRef.current = nextDisplayHeadings;
  }, [flights, selectedEntity, viewer]);

  // Smooth playback animation — rAF loop updates billboard positions in-place
  useEffect(() => {
    if (playbackMode !== "playback") return;
    const collection = collectionRef.current;
    if (!collection) return;

    let rafId: number;
    let lastProcessedTime = 0;

    const animate = () => {
      const { playbackTime, snapshotTime, snapshotFlights } =
        usePlaybackStore.getState();

      if (playbackTime !== lastProcessedTime && collection.length > 0) {
        lastProcessedTime = playbackTime;
        const dtSeconds = (playbackTime - snapshotTime) / 1000;
        const len = Math.min(collection.length, snapshotFlights.length);

        for (let i = 0; i < len; i++) {
          const f = snapshotFlights[i];
          const billboard = collection.get(i);
          if (!billboard) continue;

          if (f.onGround || f.velocity === 0) continue;

          const headingRad = (f.heading * Math.PI) / 180;
          const latRad = (f.lat * Math.PI) / 180;
          const cosLat = Math.cos(latRad);
          const dLat =
            (f.velocity * Math.cos(headingRad) * dtSeconds) / 111320;
          const dLon =
            cosLat !== 0
              ? (f.velocity * Math.sin(headingRad) * dtSeconds) /
                (111320 * cosLat)
              : 0;

          billboard.position = Cartesian3.fromDegrees(
            f.lon + dLon,
            f.lat + dLat,
            f.altitude,
          );
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [playbackMode, flights]);

  return null;
}
