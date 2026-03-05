export const API_URLS = {
  CELESTRAK_TLE:
    "/api/celestrak/NORAD/elements/gp.php?GROUP=active&FORMAT=tle",
  OPENSKY_STATES: "/api/opensky/api/states/all",
  ADSB_MILITARY: "/api/adsb/v2/mil",
  USGS_EARTHQUAKES:
    "/api/usgs/earthquakes/feed/v1.0/summary/all_day.geojson",
  OVERPASS: "https://overpass-api.de/api/interpreter",
  IODA_OUTAGES: "/api/ioda/v2/outages/events",
  GPSJAM_DATA: "/api/gpsjam/data",
} as const;

export const REFRESH_INTERVALS = {
  SATELLITES: 60 * 60 * 1000, // 60 min
  FLIGHTS: 10 * 1000, // 10s
  MILITARY: 10 * 1000, // 10s
  EARTHQUAKES: 5 * 60 * 1000, // 5 min
  CCTV: 60 * 1000, // 1 min
  TRAFFIC: 5 * 60 * 1000, // 5 min
  SURVEILLANCE: 1000, // 1s propagation
  GPS_JAMMING: 24 * 60 * 60 * 1000, // 24h
  AIS: 15 * 1000, // 15s
  INTERNET_OUTAGES: 5 * 60 * 1000, // 5 min
} as const;

export const VISUAL_MODES = {
  normal: { key: "1", label: "Normal", shortLabel: "NRM" },
  crt: { key: "2", label: "CRT", shortLabel: "CRT" },
  nightVision: { key: "3", label: "Night Vision", shortLabel: "NVG" },
  flir: { key: "4", label: "FLIR", shortLabel: "FLR" },
} as const;

export const LAYER_CONFIG = {
  satellites: { label: "Satellites", color: "#00ff88", icon: "Satellite" },
  flights: { label: "Flights", color: "#00aaff", icon: "Plane" },
  military: { label: "Military", color: "#ff8800", icon: "Shield" },
  earthquakes: { label: "Earthquakes", color: "#ff4444", icon: "Activity" },
  countryLabels: { label: "Country Labels", color: "#66ddff", icon: "Map" },
  cctv: { label: "CCTV", color: "#ffff00", icon: "Camera" },
  traffic: { label: "Traffic", color: "#aa44ff", icon: "Car" },
  surveillance: { label: "Surveillance", color: "#ff00ff", icon: "ScanEye" },
  gpsJamming: { label: "GPS Jamming", color: "#ff3333", icon: "TriangleAlert" },
  ais: { label: "Maritime AIS", color: "#00ddff", icon: "Ship" },
  airspace: { label: "Airspace", color: "#ff6600", icon: "Ban" },
  internetOutages: { label: "Internet", color: "#ff0066", icon: "WifiOff" },
} as const;
