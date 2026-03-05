# God's Eye - Architecture

## Tech Stack

- **Framework**: React 19 + Vite 7 + TypeScript 5.9
- **3D Globe**: CesiumJS + Resium (React bindings)
- **3D Tiles**: Google Photorealistic 3D Tiles (via Maps Tile API)
- **Styling**: Tailwind CSS v4 with custom military theme
- **State Management**: Zustand v5
- **Satellite Propagation**: satellite.js (SGP4/SDP4)
- **Icons**: Lucide React

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root layout (Globe + HUD overlays)
├── stores/
│   ├── useLayerStore.ts        # Data layer visibility + counts
│   ├── useViewStore.ts         # Visual mode, sidebar, shader params, HUD state
│   ├── useTrackingStore.ts     # Selected entity tracking
│   └── usePlaybackStore.ts     # LIVE/PLAYBACK mode, virtual clock, speed, snapshots
├── components/
│   ├── Globe/
│   │   ├── GlobeViewer.tsx     # Main Cesium Viewer wrapper
│   │   ├── GoogleTiles.tsx     # Google 3D Tiles tileset
│   │   └── PostProcessing.tsx  # CRT/NVG/FLIR shader effects
│   ├── Layers/
│   │   ├── SatelliteLayer.tsx  # Real-time satellite positions (CelesTrak)
│   │   ├── FlightLayer.tsx     # Commercial flights (OpenSky)
│   │   ├── MilitaryLayer.tsx   # Military aircraft (ADSB.lol)
│   │   ├── EarthquakeLayer.tsx # Seismic activity (USGS)
│   │   ├── CCTVLayer.tsx       # Traffic cameras (Austin DOT)
│   │   ├── TrafficLayer.tsx    # Road overlay (Overpass API)
│   │   ├── SurveillanceLayer.tsx # Recon satellite passes (CelesTrak filtered)
│   │   ├── GPSJammingLayer.tsx # GPS interference zones (GPSJam)
│   │   ├── AISLayer.tsx        # Maritime vessel tracking (mock data)
│   │   ├── AirspaceLayer.tsx   # No-fly zones / restricted airspace (static)
│   │   └── InternetOutageLayer.tsx # Internet blackout events (IODA)
│   ├── UI/
│   │   ├── HudOverlay.tsx      # Full-screen transparent HUD (4 corners + center)
│   │   ├── Sidebar.tsx         # Left accordion sidebar (CCTV/Layers/Scenes)
│   │   ├── ControlPanel.tsx    # Right panel (visual mode, shader sliders)
│   │   ├── BottomBar.tsx       # Bottom bar (layer chips + UTC timestamp)
│   │   ├── LayerPanel.tsx      # Toggle data layers
│   │   ├── EntityInfo.tsx      # Right-panel entity details (z-50)
│   │   ├── ModeToggle.tsx      # LIVE/PLAYBACK pill toggle (top center)
│   │   ├── PlaybackScrubber.tsx # Bottom bar: timeline, speed, layer chips (playback mode)
│   │   ├── LocationJumper.tsx  # City/landmark navigation
│   │   └── controls/
│   │       └── Slider.tsx      # Reusable teal-themed range slider
│   └── common/
│       └── LoadingOverlay.tsx  # Boot-up animation
├── hooks/
│   ├── useSatellites.ts        # TLE fetch + SGP4 propagation
│   ├── useFlights.ts           # OpenSky API polling
│   ├── useMilitary.ts          # ADSB.lol military endpoint
│   ├── useEarthquakes.ts       # USGS GeoJSON feed
│   ├── useCCTV.ts              # Static camera index
│   ├── useTraffic.ts           # Overpass road query
│   ├── useSurveillance.ts     # Recon sat TLE filter + propagation
│   ├── useGPSJamming.ts       # GPSJam CSV fetch + H3 parsing
│   ├── useAIS.ts              # Simulated AIS vessels (Strait of Hormuz)
│   ├── useAirspace.ts         # Static no-fly zone polygons
│   ├── useInternetOutages.ts  # IODA outage events
│   ├── useCameraPosition.ts    # Cesium camera lat/lon/alt (throttled 200ms)
│   └── useKeyboardShortcuts.ts # Global keyboard handler (1-4, Q-T, [/], H, Esc)
├── shaders/
│   ├── crt.ts                  # CRT scanline + curvature + chromatic aberration
│   ├── nightVision.ts          # NVG green phosphor + grain
│   └── flir.ts                 # FLIR thermal colormap + edge detection
├── lib/
│   ├── api.ts                  # fetch wrappers
│   ├── satellites.ts           # TLE parsing + SGP4 helpers
│   ├── extrapolate.ts          # Flight position extrapolation (velocity + heading)
│   ├── landmarks.ts            # City/landmark coordinate database
│   ├── coordinates.ts          # DMS conversion, GSD estimation, sun angle
│   ├── constants.ts            # API URLs, intervals, config
│   ├── h3.ts                  # H3 hex → lat/lon converter (no npm dep)
│   └── countries.ts           # Country ISO code → centroid lookup
└── types/
    └── index.ts                # TypeScript interfaces (ShaderParams, HudLayout, etc.)
```

## UI Architecture (WorldView HUD Style)

The UI uses transparent overlays floating over the globe, preserving full globe interaction via `pointer-events-none`:

1. **HudOverlay** (z-30) — Fixed corners with military-style telemetry:
   - Top-Left: Logo, classification, mode name, perf stats
   - Top-Center: LIVE/PLAYBACK mode toggle (ModeToggle component)
   - Top-Right: Active style, REC timestamp, orbit info
   - Bottom-Left: Camera lat/lon (DMS), MGRS
   - Bottom-Right: GSD, altitude, sun angle
2. **Sidebar** (z-40) — Left accordion with collapsible sections (CCTV Mesh, Data Layers, Scenes)
3. **ControlPanel** (z-40) — Right panel with visual mode selector + shader parameter sliders
4. **BottomBar** (z-30) — Layer filter chip row + UTC clock
5. **EntityInfo** (z-50) — Right entity detail panel (overlays ControlPanel)

Clean UI mode (`H` key) hides the HudOverlay for unobstructed globe view.

## State Architecture (Zustand)

Four stores with clear boundaries:
1. **useLayerStore** — Which data layers are visible + entity counts
2. **useViewStore** — Visual mode, sidebar state, shader params, clean UI toggle, accordion section states, right panel open/close, current city/landmark
3. **useTrackingStore** — Currently selected entity for info panel
4. **usePlaybackStore** — LIVE/PLAYBACK mode, virtual playback clock, speed multiplier (1/3/5/15/60 min/s), play/pause, flight/military snapshots for extrapolation, rAF loop management

## Rendering Pipeline

1. Cesium Viewer renders 3D globe
2. Google 3D Tiles provide photorealistic ground
3. Data layers render as Cesium entities (points, billboards, polylines, ellipses)
4. PostProcessing applies GLSL fragment shaders based on active visual mode
5. React UI components overlay the globe (HUD, sidebar, control panel, bottom bar, entity panel)

## Keyboard Shortcuts

- `1-4`: Visual modes (Normal, CRT, NVG, FLIR)
- `Q/W/E/R/T`: Jump to landmarks in current city
- `[/]`: Cycle between cities
- `H`: Toggle clean UI (hide/show HUD overlays)
- `Space`: Toggle play/pause (playback mode only)
- `Esc`: Deselect / close panels

## Playback System

The playback system allows scrubbing through historical positions:

- **ModeToggle** (top center): Switches between LIVE (green, real-time API polling) and PLAYBACK (amber, snapshot extrapolation)
- **PlaybackScrubber** (bottom bar, playback only): Play/pause button, 24h timeline slider with earthquake markers, speed chips (1m/s–1h/s), layer toggles, UTC time display
- **Snapshot approach**: On entering playback, current flight/military data is snapshotted. Positions are extrapolated using velocity + heading via `extrapolateFlights()`. Satellites use SGP4 propagation at the virtual playback time.
- **rAF clock**: A `requestAnimationFrame` loop in PlaybackScrubber advances `playbackTime` at `speed * 60` simulated seconds per real second
- **Hook branching**: Data hooks (`useFlights`, `useMilitary`) stop API polling in playback and instead extrapolate from snapshots every 1s. `useSatellites` uses `playbackTime` instead of `new Date()` for propagation. TLE fetching continues regardless of mode.
- **Window globals**: `window.__latestFlights`, `window.__latestMilitary`, `window.__latestEarthquakes` are set on each fetch for snapshot capture and timeline markers
