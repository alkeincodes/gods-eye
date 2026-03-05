import { useRef, useEffect } from "react";
import {
  Viewer,
  Globe,
  Scene,
  ImageryLayer,
  type CesiumComponentRef,
} from "resium";
import {
  Ion,
  Viewer as CesiumViewer,
  Color,
  SceneMode,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  createWorldImageryAsync,
  type ImageryProvider,
  type TerrainProvider,
  UrlTemplateImageryProvider,
} from "cesium";
import { PostProcessing } from "./PostProcessing";
import { SatelliteLayer } from "../Layers/SatelliteLayer";
import { FlightLayer } from "../Layers/FlightLayer";
import { MilitaryLayer } from "../Layers/MilitaryLayer";
import { EarthquakeLayer } from "../Layers/EarthquakeLayer";
import { CountryLabelsLayer } from "../Layers/CountryLabelsLayer";
import { CCTVLayer } from "../Layers/CCTVLayer";
import { TrafficLayer } from "../Layers/TrafficLayer";
import { SurveillanceLayer } from "../Layers/SurveillanceLayer";
import { GPSJammingLayer } from "../Layers/GPSJammingLayer";
import { AISLayer } from "../Layers/AISLayer";
import { AirspaceLayer } from "../Layers/AirspaceLayer";
import { InternetOutageLayer } from "../Layers/InternetOutageLayer";
import { useLayerStore } from "../../stores/useLayerStore";
import { waitForViewerReady } from "../../lib/waitForViewerReady";

const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
if (cesiumToken) {
  Ion.defaultAccessToken = cesiumToken;
}

// Hoist constant Color objects to avoid new instances on every render
const BG_COLOR = Color.fromCssColorString("#0a0a0a");

// Public full-color base map fallback (no auth required)
const baseTileProvider = new UrlTemplateImageryProvider({
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  credit: "OpenStreetMap contributors",
  maximumLevel: 18,
});

const baseImageryProvider: ImageryProvider | Promise<ImageryProvider> =
  cesiumToken
    ? createWorldImageryAsync().catch((err) => {
        console.warn("Failed to load Cesium ion imagery, using OSM fallback:", err);
        return baseTileProvider;
      })
    : baseTileProvider;

const ionTerrainProvider: TerrainProvider | Promise<TerrainProvider> | undefined =
  cesiumToken
    ? CesiumTerrainProvider.fromIonAssetId(1).catch((err) => {
        console.warn("Failed to load Cesium ion terrain, using ellipsoid terrain:", err);
        return new EllipsoidTerrainProvider();
      })
    : undefined;

export function GlobeViewer() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer> | null>(null);

  // Subscribe to individual layer booleans to avoid re-rendering on unrelated layer changes
  const showSatellites = useLayerStore((s) => s.layers.satellites);
  const showFlights = useLayerStore((s) => s.layers.flights);
  const showMilitary = useLayerStore((s) => s.layers.military);
  const showEarthquakes = useLayerStore((s) => s.layers.earthquakes);
  const showCountryLabels = useLayerStore((s) => s.layers.countryLabels);
  const showCctv = useLayerStore((s) => s.layers.cctv);
  const showTraffic = useLayerStore((s) => s.layers.traffic);
  const showSurveillance = useLayerStore((s) => s.layers.surveillance);
  const showGpsJamming = useLayerStore((s) => s.layers.gpsJamming);
  const showAis = useLayerStore((s) => s.layers.ais);
  const showAirspace = useLayerStore((s) => s.layers.airspace);
  const showInternetOutages = useLayerStore((s) => s.layers.internetOutages);

  useEffect(() => {
    const stopWaiting = waitForViewerReady(
      () => viewerRef.current?.cesiumElement,
      (viewer) => {
        // Expose viewer globally for keyboard navigation
        (window as unknown as Record<string, unknown>).__cesiumViewer = viewer;

        // Dark atmosphere
        viewer.scene.globe.enableLighting = false;
        viewer.scene.backgroundColor = BG_COLOR;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0002;
        viewer.scene.globe.showGroundAtmosphere = false;
      },
    );

    return () => {
      stopWaiting();
      delete (window as unknown as Record<string, unknown>).__cesiumViewer;
    };
  }, []);

  return (
    <Viewer
      ref={viewerRef}
      full
      timeline={false}
      animation={false}
      baseLayer={false}
      terrainProvider={ionTerrainProvider}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      selectionIndicator={false}
      infoBox={false}
      scene3DOnly
      sceneMode={SceneMode.SCENE3D}
      requestRenderMode={false}
    >
      <Scene backgroundColor={BG_COLOR} />
      <Globe
        baseColor={BG_COLOR}
        showGroundAtmosphere={false}
        enableLighting={false}
      />
      <ImageryLayer imageryProvider={baseImageryProvider} />
      <PostProcessing />
      {showSatellites && <SatelliteLayer />}
      {showFlights && <FlightLayer />}
      {showMilitary && <MilitaryLayer />}
      {showEarthquakes && <EarthquakeLayer />}
      {showCountryLabels && <CountryLabelsLayer />}
      {showCctv && <CCTVLayer />}
      {showTraffic && <TrafficLayer />}
      {showSurveillance && <SurveillanceLayer />}
      {showGpsJamming && <GPSJammingLayer />}
      {showAis && <AISLayer />}
      {showAirspace && <AirspaceLayer />}
      {showInternetOutages && <InternetOutageLayer />}
    </Viewer>
  );
}
