import { useState, useEffect, useRef, useCallback } from "react";
import { fetchText } from "../lib/api";
import { parseTLEs, propagateSatellite } from "../lib/satellites";
import { useLayerStore } from "../stores/useLayerStore";
import { usePlaybackStore } from "../stores/usePlaybackStore";
import { API_URLS } from "../lib/constants";
import type { SatelliteData, SurveillancePass } from "../types";

const RECON_SATS: Record<string, { operator: string; type: string }> = {
  // Maxar (WorldView / Legion)
  "32060": { operator: "Maxar", type: "Optical (WorldView-1)" },
  "35946": { operator: "Maxar", type: "Optical (WorldView-2)" },
  "40115": { operator: "Maxar", type: "Optical (WorldView-3)" },
  "33331": { operator: "Maxar", type: "Optical (GeoEye-1)" },
  "59625": { operator: "Maxar", type: "Optical (Legion-1)" },
  "59626": { operator: "Maxar", type: "Optical (Legion-2)" },
  "60452": { operator: "Maxar", type: "Optical (Legion-3)" },
  "60453": { operator: "Maxar", type: "Optical (Legion-4)" },
  // Capella Space (SAR)
  "51072": { operator: "Capella", type: "SAR" },
  "51071": { operator: "Capella", type: "SAR" },
  "55910": { operator: "Capella", type: "SAR" },
  "55909": { operator: "Capella", type: "SAR" },
  "57693": { operator: "Capella", type: "SAR" },
  "59444": { operator: "Capella", type: "SAR" },
  // Gaofen (China)
  "39150": { operator: "CNSA", type: "Optical (Gaofen)" },
  "40118": { operator: "CNSA", type: "Optical (Gaofen)" },
  "41727": { operator: "CNSA", type: "Optical (Gaofen)" },
  "44703": { operator: "CNSA", type: "Optical (Gaofen)" },
  // Russia (Persona / Bars-M)
  "39177": { operator: "Russia", type: "Optical (Persona)" },
  "40699": { operator: "Russia", type: "Optical (Bars-M)" },
  "41394": { operator: "Russia", type: "Optical (Bars-M)" },
  "44835": { operator: "Russia", type: "Optical (Bars-M)" },
  "52713": { operator: "Russia", type: "Optical (Bars-M)" },
  "55978": { operator: "Russia", type: "Optical (Bars-M)" },
  // USA-234 (Topaz)
  "38109": { operator: "NRO", type: "Radar (Topaz)" },
};

const NORAD_IDS = new Set(Object.keys(RECON_SATS));

function computeGroundTrack(
  sat: SatelliteData,
  startTime: Date,
  points: number = 60,
  durationMin: number = 10,
): { lat: number; lon: number }[] {
  const track: { lat: number; lon: number }[] = [];
  const stepMs = (durationMin * 60 * 1000) / points;
  for (let i = 0; i <= points; i++) {
    const t = new Date(startTime.getTime() + i * stepMs);
    const pos = propagateSatellite(sat, t);
    if (pos) {
      track.push({ lat: pos.lat, lon: pos.lon });
    }
  }
  return track;
}

export function useSurveillance() {
  const [passes, setPasses] = useState<SurveillancePass[]>([]);
  const [loading, setLoading] = useState(true);
  const tleDataRef = useRef<SatelliteData[]>([]);
  const setCount = useLayerStore((s) => s.setCount);
  const mode = usePlaybackStore((s) => s.mode);
  const playbackTime = usePlaybackStore((s) => s.playbackTime);
  const selectedIdRef = useRef<string | null>(null);

  // Fetch TLEs once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const text = await fetchText(API_URLS.CELESTRAK_TLE);
        const allTLEs = parseTLEs(text);
        const filtered = allTLEs.filter((s) => NORAD_IDS.has(s.id));
        if (!cancelled) {
          tleDataRef.current = filtered;
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch surveillance TLEs:", e);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Propagate positions every second
  useEffect(() => {
    if (loading || tleDataRef.current.length === 0) return;

    const update = () => {
      const time = mode === "playback" ? new Date(playbackTime) : new Date();
      const results: SurveillancePass[] = [];

      for (const sat of tleDataRef.current) {
        const pos = propagateSatellite(sat, time);
        if (!pos) continue;

        const meta = RECON_SATS[sat.id] || {
          operator: "Unknown",
          type: "Unknown",
        };
        const id = `surv-${sat.id}`;

        let groundTrack: { lat: number; lon: number }[] = [];
        if (selectedIdRef.current === id) {
          groundTrack = computeGroundTrack(sat, time);
        }

        results.push({
          id,
          name: sat.name,
          noradId: parseInt(sat.id, 10),
          operator: meta.operator,
          type: meta.type,
          lat: pos.lat,
          lon: pos.lon,
          alt: pos.alt,
          tle1: sat.tle1,
          tle2: sat.tle2,
          groundTrack,
        });
      }

      setPasses(results);
      setCount("surveillance", results.length);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [loading, mode, playbackTime, setCount]);

  const setSelectedId = useCallback((id: string | null) => {
    selectedIdRef.current = id;
  }, []);

  return { passes, loading, setSelectedId };
}
