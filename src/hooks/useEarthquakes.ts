import { useState, useEffect, useCallback } from "react";
import { fetchJSON } from "../lib/api";
import { useLayerStore } from "../stores/useLayerStore";
import { API_URLS, REFRESH_INTERVALS } from "../lib/constants";
import type { EarthquakeData } from "../types";

interface USGSResponse {
  features: {
    id: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      url: string;
    };
    geometry: {
      coordinates: [number, number, number];
    };
  }[];
}

export function useEarthquakes() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);

  const fetchEarthquakes = useCallback(async () => {
    try {
      const data = await fetchJSON<USGSResponse>(API_URLS.USGS_EARTHQUAKES);
      const parsed: EarthquakeData[] = data.features.map((f) => ({
        id: f.id,
        magnitude: f.properties.mag,
        depth: f.geometry.coordinates[2],
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        place: f.properties.place,
        time: f.properties.time,
        url: f.properties.url,
      }));

      (window as unknown as Record<string, unknown>).__latestEarthquakes = parsed;
      setEarthquakes(parsed);
      setCount("earthquakes", parsed.length);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch earthquakes:", err);
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(
      fetchEarthquakes,
      REFRESH_INTERVALS.EARTHQUAKES,
    );
    return () => clearInterval(interval);
  }, [fetchEarthquakes]);

  return { earthquakes, loading };
}
