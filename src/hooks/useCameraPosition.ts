import { useState, useEffect, useRef, useCallback } from "react";
import {
  Cartographic,
  Math as CesiumMath,
  Viewer as CesiumViewer,
} from "cesium";

interface CameraPosition {
  lat: number;
  lon: number;
  altMeters: number;
  heading: number;
  pitch: number;
}

const DEFAULT_POS: CameraPosition = {
  lat: 38.871,
  lon: -77.0559,
  altMeters: 2000,
  heading: 0,
  pitch: -45,
};

function getViewer(): CesiumViewer | null {
  return (
    ((window as unknown as Record<string, unknown>).__cesiumViewer as CesiumViewer) ??
    null
  );
}

export function useCameraPosition(): CameraPosition {
  const [pos, setPos] = useState<CameraPosition>(DEFAULT_POS);
  const lastUpdate = useRef(0);
  const removeListenerRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback(() => {
    // Clean up any existing listener
    removeListenerRef.current?.();
    removeListenerRef.current = null;

    const viewer = getViewer();
    if (!viewer || viewer.isDestroyed()) return false;

    removeListenerRef.current = viewer.scene.postRender.addEventListener(() => {
      const now = Date.now();
      if (now - lastUpdate.current < 200) return;
      lastUpdate.current = now;

      try {
        const cam = viewer.camera;
        const carto = Cartographic.fromCartesian(cam.positionWC);
        setPos({
          lat: CesiumMath.toDegrees(carto.latitude),
          lon: CesiumMath.toDegrees(carto.longitude),
          altMeters: carto.height,
          heading: CesiumMath.toDegrees(cam.heading),
          pitch: CesiumMath.toDegrees(cam.pitch),
        });
      } catch {
        // Viewer may have been destroyed between check and use
      }
    });

    return true;
  }, []);

  useEffect(() => {
    // Try immediately
    if (subscribe()) return () => removeListenerRef.current?.();

    // If viewer isn't ready yet, poll until it is
    const interval = setInterval(() => {
      if (subscribe()) clearInterval(interval);
    }, 500);

    return () => {
      clearInterval(interval);
      removeListenerRef.current?.();
    };
  }, [subscribe]);

  return pos;
}
