import { useCesium } from "resium";
import { useEffect, useRef } from "react";
import {
  Cesium3DTileset,
  Resource,
  Cartesian3,
  Math as CesiumMath,
} from "cesium";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function GoogleTiles() {
  const { viewer } = useCesium();
  const tilesetRef = useRef<Cesium3DTileset | null>(null);

  useEffect(() => {
    if (!viewer || !API_KEY) return;

    let cancelled = false;

    async function loadTiles() {
      if (!viewer) return;
      try {
        const tileset = await Cesium3DTileset.fromUrl(
          new Resource({
            url: `https://tile.googleapis.com/v1/3dtiles/root.json`,
            queryParameters: { key: API_KEY },
          }),
        );

        // If effect was cleaned up during async load, discard the tileset
        if (cancelled) {
          tileset.destroy();
          return;
        }

        tileset.style = undefined;
        tilesetRef.current = tileset;
        viewer.scene.primitives.add(tileset);

        // Fly to initial view (Washington DC area, looking at the globe)
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(-77.0369, 38.9072, 15000000),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-90),
            roll: 0,
          },
          duration: 0,
        });
      } catch (err) {
        console.warn("Failed to load Google 3D Tiles:", err);
        if (!cancelled && viewer && !viewer.isDestroyed()) {
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(-77.0369, 38.9072, 15000000),
            orientation: {
              heading: CesiumMath.toRadians(0),
              pitch: CesiumMath.toRadians(-90),
              roll: 0,
            },
            duration: 0,
          });
        }
      }
    }

    loadTiles();

    return () => {
      cancelled = true;
      if (tilesetRef.current && viewer && !viewer.isDestroyed()) {
        viewer.scene.primitives.remove(tilesetRef.current);
        tilesetRef.current = null;
      }
    };
  }, [viewer]);

  return null;
}
