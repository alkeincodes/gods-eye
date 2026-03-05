import { useState, useEffect, useCallback } from "react";
import { fetchJSON } from "../lib/api";
import { useLayerStore } from "../stores/useLayerStore";
import { usePlaybackStore } from "../stores/usePlaybackStore";
import { API_URLS, REFRESH_INTERVALS } from "../lib/constants";
import type { MilitaryFlightData } from "../types";

interface ADSBResponse {
  ac?: {
    hex: string;
    flight?: string;
    t?: string;
    ownOp?: string;
    r?: string;
    lat?: number;
    lon?: number;
    alt_baro?: number | string;
    gs?: number;
    track?: number;
    baro_rate?: number;
  }[];
}

export function useMilitary() {
  const [military, setMilitary] = useState<MilitaryFlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);
  const mode = usePlaybackStore((s) => s.mode);

  const fetchMilitary = useCallback(async () => {
    try {
      const data = await fetchJSON<ADSBResponse>(API_URLS.ADSB_MILITARY);
      const parsed: MilitaryFlightData[] = (data.ac || [])
        .filter((a) => a.lat != null && a.lon != null)
        .map((a) => ({
          icao24: a.hex,
          callsign: (a.flight || "").trim(),
          originCountry: "",
          lon: a.lon!,
          lat: a.lat!,
          altitude:
            typeof a.alt_baro === "number"
              ? a.alt_baro * 0.3048 // feet to meters
              : 0,
          velocity: (a.gs || 0) * 0.514444, // knots to m/s
          heading: a.track || 0,
          verticalRate: (a.baro_rate || 0) * 0.00508, // fpm to m/s
          onGround: false,
          type: a.t || "Unknown",
          operator: a.ownOp || "Unknown",
          registration: a.r || "",
        }));

      (window as unknown as Record<string, unknown>).__latestMilitary = parsed;
      setMilitary(parsed);
      setCount("military", parsed.length);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch military flights:", err);
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    if (mode === "playback") {
      // Set snapshot data once — layer handles smooth animation via rAF
      const { snapshotMilitary } = usePlaybackStore.getState();
      setMilitary(snapshotMilitary);
      setCount("military", snapshotMilitary.length);
      setLoading(false);
      return;
    }

    fetchMilitary();
    const interval = setInterval(fetchMilitary, REFRESH_INTERVALS.MILITARY);
    return () => clearInterval(interval);
  }, [fetchMilitary, mode, setCount]);

  return { military, loading };
}
