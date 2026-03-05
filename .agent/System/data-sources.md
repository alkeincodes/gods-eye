# God's Eye - Data Sources

## API Endpoints

| Source | URL | Refresh | Auth |
|--------|-----|---------|------|
| CelesTrak TLEs | `celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle` | 60 min | None |
| OpenSky Network | `opensky-network.org/api/states/all` | 10s | Optional (anon: 100 req/day) |
| ADSB.lol Military | `api.adsb.lol/v2/mil` | 10s | None |
| USGS Earthquakes | `earthquake.usgs.gov/.../all_day.geojson` | 5 min | None |
| Overpass (OSM) | `overpass-api.de/api/interpreter` | 5 min | None |
| Austin DOT CCTV | `its.txdot.gov/...` (static list) | 1 min | None |
| CelesTrak (Surveillance) | Same as CelesTrak TLEs, filtered by NORAD ID | 1s propagation | None |
| GPSJam | `gpsjam.org/data/YYYY-MM-DD-h3_4.csv` | 24h | None |
| AIS Maritime | Mock data (Strait of Hormuz simulation) | 15s | N/A |
| Airspace Closures | Static hardcoded zones | Never | N/A |
| IODA Internet Outages | `api.ioda.inetintel.cc.gatech.edu/v2/outages/events` | 5 min | None |

## Environment Variables

```
VITE_GOOGLE_MAPS_API_KEY=   # Required for Google 3D Tiles
VITE_CESIUM_ION_TOKEN=      # Optional: Cesium Ion terrain
VITE_OPENSKY_USERNAME=      # Optional: higher rate limits
VITE_OPENSKY_PASSWORD=      # Optional
```

## Data Flow

1. Hooks (`use*.ts`) fetch from APIs at configured intervals
2. Data is parsed into typed interfaces (`types/index.ts`)
3. Counts are pushed to `useLayerStore` for the stats bar
4. Layer components read data from hooks and render Cesium entities
5. Click handlers push selected entity to `useTrackingStore` for the info panel
