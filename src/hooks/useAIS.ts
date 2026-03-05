import { useState, useEffect, useRef, useCallback } from "react";
import { useLayerStore } from "../stores/useLayerStore";
import type { AISVessel } from "../types";

const VESSEL_DATA: Omit<AISVessel, "lat" | "lon" | "heading" | "speed">[] = [
  // Tankers (~15)
  { mmsi: "636092587", name: "PERSIAN STAR", type: "tanker", flag: "Liberia", destination: "Jebel Ali" },
  { mmsi: "538006243", name: "GULF CARRIER", type: "tanker", flag: "Marshall Islands", destination: "Ras Tanura" },
  { mmsi: "353411000", name: "ARABIAN SPIRIT", type: "tanker", flag: "Panama", destination: "Fujairah" },
  { mmsi: "636018505", name: "HORMUZ VOYAGER", type: "tanker", flag: "Liberia", destination: "Bandar Abbas" },
  { mmsi: "229385000", name: "ENERGY TITAN", type: "tanker", flag: "Malta", destination: "Jebel Ali" },
  { mmsi: "538007891", name: "CRUDE NAVIGATOR", type: "tanker", flag: "Marshall Islands", destination: "Ras Tanura" },
  { mmsi: "353287000", name: "PETRO FORTUNE", type: "tanker", flag: "Panama", destination: "Fujairah" },
  { mmsi: "636091234", name: "MINA AL FAHAL", type: "tanker", flag: "Liberia", destination: "Muscat" },
  { mmsi: "422100100", name: "SABITI", type: "tanker", flag: "Iran", destination: "Bandar Abbas" },
  { mmsi: "422100200", name: "KHARG", type: "tanker", flag: "Iran", destination: "Bandar Abbas" },
  { mmsi: "538008456", name: "SEA DIAMOND", type: "tanker", flag: "Marshall Islands", destination: "Jebel Ali" },
  { mmsi: "353500100", name: "PACIFIC GRACE", type: "tanker", flag: "Panama", destination: "Fujairah" },
  { mmsi: "636095001", name: "NORDIC BREEZE", type: "tanker", flag: "Liberia", destination: "Ras Tanura" },
  { mmsi: "229390000", name: "ATHENA GLORY", type: "tanker", flag: "Malta", destination: "Muscat" },
  { mmsi: "353600200", name: "OCEAN PEARL", type: "tanker", flag: "Panama", destination: "Jebel Ali" },

  // Cargo (~12)
  { mmsi: "470553000", name: "GULF TRADER", type: "cargo", flag: "UAE", destination: "Jebel Ali" },
  { mmsi: "470554000", name: "EMIRATES PROGRESS", type: "cargo", flag: "UAE", destination: "Fujairah" },
  { mmsi: "353700300", name: "ASIA FORTUNE", type: "cargo", flag: "Panama", destination: "Bandar Abbas" },
  { mmsi: "636096002", name: "STAR CARRIER", type: "cargo", flag: "Liberia", destination: "Jebel Ali" },
  { mmsi: "538009100", name: "GLOBAL VENTURE", type: "cargo", flag: "Marshall Islands", destination: "Ras Tanura" },
  { mmsi: "422200100", name: "IRAN HORMUZ", type: "cargo", flag: "Iran", destination: "Bandar Abbas" },
  { mmsi: "353800400", name: "CONTAINER KING", type: "cargo", flag: "Panama", destination: "Jebel Ali" },
  { mmsi: "636097003", name: "TRADE WIND", type: "cargo", flag: "Liberia", destination: "Fujairah" },
  { mmsi: "538010200", name: "PACIFIC MERCHANT", type: "cargo", flag: "Marshall Islands", destination: "Muscat" },
  { mmsi: "470555000", name: "DUBAI EXPRESS", type: "cargo", flag: "UAE", destination: "Jebel Ali" },
  { mmsi: "353900500", name: "SILK ROAD", type: "cargo", flag: "Panama", destination: "Bandar Abbas" },
  { mmsi: "636098004", name: "CAPE TRADER", type: "cargo", flag: "Liberia", destination: "Ras Tanura" },

  // Naval (~5)
  { mmsi: "419000100", name: "INS VIKRANT", type: "naval", flag: "India", destination: "Patrol" },
  { mmsi: "419000200", name: "INS KOLKATA", type: "naval", flag: "India", destination: "Patrol" },
  { mmsi: "470000100", name: "AL DHAFRA", type: "naval", flag: "UAE", destination: "Patrol" },
  { mmsi: "422300100", name: "ALVAND", type: "naval", flag: "Iran", destination: "Patrol" },
  { mmsi: "503000100", name: "HMAS TOOWOOMBA", type: "naval", flag: "Australia", destination: "Patrol" },

  // Fishing (~8)
  { mmsi: "470600100", name: "AL MARJAN", type: "fishing", flag: "UAE", destination: "Fishing Grounds" },
  { mmsi: "470600200", name: "PEARL DIVER", type: "fishing", flag: "UAE", destination: "Fishing Grounds" },
  { mmsi: "422400100", name: "SETAREH", type: "fishing", flag: "Iran", destination: "Fishing Grounds" },
  { mmsi: "422400200", name: "DARYA", type: "fishing", flag: "Iran", destination: "Fishing Grounds" },
  { mmsi: "461000100", name: "AL NAKHEEL", type: "fishing", flag: "Oman", destination: "Fishing Grounds" },
  { mmsi: "461000200", name: "MUSCAT FISHER", type: "fishing", flag: "Oman", destination: "Fishing Grounds" },
  { mmsi: "470600300", name: "HAMOUR", type: "fishing", flag: "UAE", destination: "Fishing Grounds" },
  { mmsi: "422400300", name: "BANDAR", type: "fishing", flag: "Iran", destination: "Fishing Grounds" },
];

const LAT_MIN = 25.5;
const LAT_MAX = 27.5;
const LON_MIN = 55;
const LON_MAX = 58;

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateInitialVessels(): AISVessel[] {
  return VESSEL_DATA.map((data) => ({
    ...data,
    lat: randomInRange(LAT_MIN, LAT_MAX),
    lon: randomInRange(LON_MIN, LON_MAX),
    heading: Math.random() * 360,
    speed: data.type === "naval" ? randomInRange(12, 25) :
           data.type === "tanker" ? randomInRange(8, 14) :
           data.type === "cargo" ? randomInRange(10, 16) :
           randomInRange(3, 8),
  }));
}

function wrapCoord(value: number, min: number, max: number): number {
  const range = max - min;
  if (value < min) return max - ((min - value) % range);
  if (value > max) return min + ((value - max) % range);
  return value;
}

export function useAIS() {
  const vesselsRef = useRef<AISVessel[] | null>(null);
  const [vessels, setVessels] = useState<AISVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);

  if (vesselsRef.current === null) {
    vesselsRef.current = generateInitialVessels();
  }

  const updatePositions = useCallback(() => {
    if (!vesselsRef.current) return;

    vesselsRef.current = vesselsRef.current.map((v) => {
      const headingRad = (v.heading * Math.PI) / 180;
      const degPerSec = (v.speed * 1.852) / 111320 / 3600;
      const latRad = (v.lat * Math.PI) / 180;

      const newLat = v.lat + degPerSec * Math.cos(headingRad) * 15;
      const newLon = v.lon + (degPerSec * Math.sin(headingRad) * 15) / Math.cos(latRad);

      return {
        ...v,
        lat: wrapCoord(newLat, LAT_MIN, LAT_MAX),
        lon: wrapCoord(newLon, LON_MIN, LON_MAX),
      };
    });

    setVessels([...vesselsRef.current]);
  }, []);

  useEffect(() => {
    setVessels(vesselsRef.current!);
    setLoading(false);
    setCount("ais", vesselsRef.current!.length);

    const interval = setInterval(updatePositions, 15000);
    return () => clearInterval(interval);
  }, [updatePositions, setCount]);

  return { vessels, loading };
}
