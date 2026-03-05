export type VisualMode = "normal" | "crt" | "nightVision" | "flir";

export type PlaybackSpeed = 1 | 3 | 5 | 15 | 60;

export interface ShaderParams {
  bloom: number;
  sharpen: number;
  pixelation: number;
  distortion: number;
  instability: number;
  density: number;
}

export type HudLayout = "tactical";

export type LayerType =
  | "satellites"
  | "flights"
  | "military"
  | "earthquakes"
  | "countryLabels"
  | "cctv"
  | "traffic"
  | "surveillance"
  | "gpsJamming"
  | "ais"
  | "airspace"
  | "internetOutages";

export interface SatelliteData {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  lat: number;
  lon: number;
  alt: number; // km
}

export interface FlightData {
  icao24: string;
  callsign: string;
  originCountry: string;
  lon: number;
  lat: number;
  altitude: number; // meters
  velocity: number; // m/s
  heading: number; // degrees
  verticalRate: number;
  onGround: boolean;
}

export interface MilitaryFlightData extends FlightData {
  type: string;
  operator: string;
  registration: string;
}

export interface EarthquakeData {
  id: string;
  magnitude: number;
  depth: number; // km
  lat: number;
  lon: number;
  place: string;
  time: number; // unix timestamp ms
  url: string;
}

export interface CCTVCamera {
  id: string;
  name: string;
  lat: number;
  lon: number;
  imageUrl: string;
  city: string;
}

export interface TrafficSegment {
  id: string;
  coordinates: [number, number][];
  roadType: string;
}

export interface Landmark {
  name: string;
  lat: number;
  lon: number;
  altitude: number; // camera altitude in meters
  heading: number;
  pitch: number;
}

export interface LandmarkCity {
  name: string;
  landmarks: Landmark[];
}

export interface SurveillancePass {
  id: string;
  name: string;
  noradId: number;
  operator: string;
  type: string; // "optical" | "sar" | "unknown"
  lat: number;
  lon: number;
  alt: number; // km
  tle1: string;
  tle2: string;
  groundTrack: { lat: number; lon: number }[];
}

export interface GPSJammingZone {
  id: string;
  h3Index: string;
  lat: number;
  lon: number;
  countGood: number;
  countBad: number;
  ratio: number; // bad / (good + bad)
}

export interface AISVessel {
  mmsi: string;
  name: string;
  type: "tanker" | "cargo" | "naval" | "fishing";
  flag: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number; // knots
  destination: string;
}

export interface AirspaceZone {
  id: string;
  name: string;
  type: "conflict" | "restricted" | "adiz";
  polygon: [number, number][]; // [lon, lat][]
  description: string;
}

export interface InternetOutage {
  id: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  score: number;
  startTime: number;
  duration: number; // seconds
  datasource: string;
}

export interface TrackedEntity {
  type: LayerType;
  id: string;
  name: string;
  data: Record<string, unknown>;
  position: { lat: number; lon: number; alt: number };
}
