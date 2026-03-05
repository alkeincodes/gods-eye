import { useState, useEffect, useRef, useCallback } from "react";
import { fetchText } from "../lib/api";
import { parseTLEs, propagateSatellite } from "../lib/satellites";
import { useLayerStore } from "../stores/useLayerStore";
import { usePlaybackStore } from "../stores/usePlaybackStore";
import { API_URLS, REFRESH_INTERVALS } from "../lib/constants";
import type { SatelliteData } from "../types";

const MAX_DISPLAY = 2000; // Limit for performance

export function useSatellites() {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [loading, setLoading] = useState(true);
  const rawSatsRef = useRef<SatelliteData[]>([]);
  const setCount = useLayerStore((s) => s.setCount);

  const fetchTLEs = useCallback(async () => {
    try {
      const text = await fetchText(API_URLS.CELESTRAK_TLE);
      const parsed = parseTLEs(text);
      // Subsample for performance
      const sampled =
        parsed.length > MAX_DISPLAY
          ? parsed.filter((_, i) => i % Math.ceil(parsed.length / MAX_DISPLAY) === 0)
          : parsed;
      rawSatsRef.current = sampled;
      setCount("satellites", parsed.length);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch TLEs:", err);
      setLoading(false);
    }
  }, [setCount]);

  // Fetch TLEs on mount and at interval
  useEffect(() => {
    fetchTLEs();
    const interval = setInterval(fetchTLEs, REFRESH_INTERVALS.SATELLITES);
    return () => clearInterval(interval);
  }, [fetchTLEs]);

  const mode = usePlaybackStore((s) => s.mode);

  // Propagate positions every second
  useEffect(() => {
    if (rawSatsRef.current.length === 0) return;

    const propagate = () => {
      const { mode: m, playbackTime } = usePlaybackStore.getState();
      const now = m === "playback" ? new Date(playbackTime) : new Date();
      const updated = rawSatsRef.current.map((sat) => {
        const pos = propagateSatellite(sat, now);
        if (pos) return { ...sat, ...pos };
        return sat;
      });
      setSatellites(updated);
    };

    const interval = setInterval(propagate, 1000);
    propagate(); // Initial propagation

    return () => clearInterval(interval);
  }, [loading, mode]);

  return { satellites, loading };
}
