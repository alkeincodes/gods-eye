import { useState, useEffect, useCallback } from "react";
import { useLayerStore } from "../stores/useLayerStore";
import { usePlaybackStore } from "../stores/usePlaybackStore";
import { getOpenSkyToken } from "../lib/opensky-auth";
import { API_URLS, REFRESH_INTERVALS } from "../lib/constants";
import type { FlightData } from "../types";

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][] | null;
}

function parseOpenSkyStates(states: OpenSkyResponse["states"]): FlightData[] {
  if (!states) return [];

  return states
    .filter((s) => s[5] != null && s[6] != null)
    .map((s) => ({
      icao24: s[0] as string,
      callsign: ((s[1] as string) || "").trim(),
      originCountry: s[2] as string,
      lon: s[5] as number,
      lat: s[6] as number,
      altitude: (s[7] as number) || 0,
      velocity: (s[9] as number) || 0,
      heading: (s[10] as number) || 0,
      verticalRate: (s[11] as number) || 0,
      onGround: s[8] as boolean,
    }));
}

export function useFlights() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);
  const mode = usePlaybackStore((s) => s.mode);

  const fetchFlights = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      const token = await getOpenSkyToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(API_URLS.OPENSKY_STATES, { headers });
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      const data: OpenSkyResponse = await res.json();

      const parsed = parseOpenSkyStates(data.states);
      (window as unknown as Record<string, unknown>).__latestFlights = parsed;
      setFlights(parsed);
      setCount("flights", parsed.length);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch flights:", err);
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    if (mode === "playback") {
      // Set snapshot data once — layer handles smooth animation via rAF
      const { snapshotFlights } = usePlaybackStore.getState();
      setFlights(snapshotFlights);
      setCount("flights", snapshotFlights.length);
      setLoading(false);
      return;
    }

    // In live mode: poll API
    fetchFlights();
    const interval = setInterval(fetchFlights, REFRESH_INTERVALS.FLIGHTS);
    return () => clearInterval(interval);
  }, [fetchFlights, mode, setCount]);

  return { flights, loading };
}
