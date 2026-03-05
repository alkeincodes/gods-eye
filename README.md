# God's Eye

An open-source real-time geospatial intelligence dashboard built with CesiumJS. Track satellites, flights, military aircraft, earthquakes, surveillance passes, GPS jamming, maritime vessels, airspace closures, and internet outages — all on a 3D globe with military-style HUD overlays.

**All data layers use free, publicly available, open data sources. No paid APIs required.**

![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![CesiumJS](https://img.shields.io/badge/CesiumJS-1.139-green)
![Vite](https://img.shields.io/badge/Vite-7-purple)

## Features

- **11 Data Layers** — Satellites, Flights, Military, Earthquakes, Country Labels, CCTV, Traffic, Surveillance Passes, GPS Jamming, Maritime AIS, Airspace Closures, Internet Outages
- **Visual Modes** — Normal, CRT scanline, Night Vision (NVG), FLIR thermal
- **Playback System** — Scrub through historical positions with adjustable speed
- **Military HUD** — Tactical overlay with camera telemetry, MGRS coords, GSD estimation
- **Keyboard Shortcuts** — Quick access to visual modes, landmarks, and UI controls
- **100% Open Data** — Every data layer is powered by free, open, no-auth APIs or open datasets

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/alkeincodes/gods-eye.git
cd gods-eye
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token
VITE_OPENSKY_CLIENT_ID=your_opensky_client_id
VITE_OPENSKY_CLIENT_SECRET=your_opensky_client_secret
```

> **All API keys are optional.** The app runs fully without any keys — it falls back to OpenStreetMap tiles and anonymous API access. Keys only improve imagery quality and rate limits.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
npm run preview
```

## Data Sources

Every data layer in God's Eye is powered by **free, open, publicly available data**. No paid subscriptions or private APIs are used.

| Layer | Source | URL | Auth | Refresh | License / Terms |
|-------|--------|-----|------|---------|-----------------|
| Satellites | [CelesTrak](https://celestrak.org/) | `celestrak.org/NORAD/elements/gp.php` | None | 60 min | Free public access |
| Flights | [OpenSky Network](https://opensky-network.org/) | `opensky-network.org/api/states/all` | Free account (optional) | 10s | [OpenSky License](https://opensky-network.org/about/terms-of-use) — free for non-commercial use |
| Military | [ADSB.lol](https://www.adsb.lol/) | `api.adsb.lol/v2/mil` | None | 10s | Free public API |
| Earthquakes | [USGS](https://earthquake.usgs.gov/) | `earthquake.usgs.gov/earthquakes/feed/` | None | 5 min | Public domain (US Government) |
| CCTV | TxDOT | `its.txdot.gov` (static list) | None | 1 min | Public government data |
| Traffic | [Overpass API (OSM)](https://overpass-api.de/) | `overpass-api.de/api/interpreter` | None | 5 min | [ODbL](https://opendatacommons.org/licenses/odbl/) |
| Surveillance | [CelesTrak](https://celestrak.org/) | Same TLE data, filtered by NORAD ID | None | 1s (propagation) | Free public access |
| GPS Jamming | [GPSJam](https://gpsjam.org/) | `gpsjam.org/data/YYYY-MM-DD-h3_4.csv` | None | 24h | Free public data |
| Maritime AIS | Simulated | Mock data (Strait of Hormuz) | N/A | 15s | N/A — generated locally |
| Airspace | Static | Hardcoded conflict/restricted zones | N/A | Never | Public knowledge |
| Internet Outages | [IODA](https://ioda.inetintel.cc.gatech.edu/) | `api.ioda.inetintel.cc.gatech.edu/v2/` | None | 5 min | Free academic research data ([Georgia Tech](https://ioda.inetintel.cc.gatech.edu/)) |

### Optional API Keys

These keys are **not required** but improve the experience:

#### Cesium Ion Token (Optional)

Provides high-resolution terrain and satellite imagery. Without it, the app uses OpenStreetMap tiles which work perfectly fine.

1. Create a free account at [cesium.com/ion](https://ion.cesium.com/)
2. Go to **Access Tokens** and copy your default token
3. Set `VITE_CESIUM_ION_TOKEN` in your `.env`

#### OpenSky Network (Optional)

Provides real-time commercial flight data. Without credentials, anonymous access works but is limited to ~100 requests/day.

1. Register for free at [opensky-network.org](https://opensky-network.org/index.php/login)
2. Navigate to **Dashboard** → **OAuth** and create client credentials
3. Set `VITE_OPENSKY_CLIENT_ID` and `VITE_OPENSKY_CLIENT_SECRET` in your `.env`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` - `4` | Switch visual mode (Normal / CRT / NVG / FLIR) |
| `Q` `W` `E` `R` `T` | Jump to landmarks in current city |
| `[` / `]` | Cycle between cities |
| `H` | Toggle clean UI (hide HUD overlays) |
| `Space` | Play / Pause (playback mode) |
| `Esc` | Deselect / close panels |

## Tech Stack

- **Framework** — React 19, Vite 7, TypeScript 5.9
- **3D Globe** — CesiumJS + Resium
- **Styling** — Tailwind CSS v4
- **State** — Zustand v5
- **Satellite Propagation** — satellite.js (SGP4/SDP4)
- **Icons** — Lucide React

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE) — you are free to use, modify, and distribute it for any purpose.

## Author

**Kane Dev** — [Twitter](https://x.com/kanedev06) · [YouTube](https://www.youtube.com/@KaneDev06) · [GitHub](https://github.com/alkeincodes) · [LinkedIn](https://www.linkedin.com/in/alkein-villajos-9520a017b/) · [Facebook](https://www.facebook.com/kanedev06)
