import { useState, useEffect, useCallback } from "react";
import { fetchText } from "../lib/api";
import { useLayerStore } from "../stores/useLayerStore";
import { API_URLS } from "../lib/constants";
import { h3ToLatLon } from "../lib/h3";
import type { GPSJammingZone } from "../types";

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

function getTodayDateStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useGPSJamming() {
  const [zones, setZones] = useState<GPSJammingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = getTodayDateStr();
      const url = `${API_URLS.GPSJAM_DATA}/${dateStr}-h3_4.csv`;
      const csv = await fetchText(url);
      const lines = csv.trim().split("\n");
      // Skip header row
      const dataLines = lines.slice(1);

      const parsed: GPSJammingZone[] = [];
      for (const line of dataLines) {
        const [hex, countGoodStr, countBadStr] = line.split(",");
        const countGood = parseInt(countGoodStr, 10);
        const countBad = parseInt(countBadStr, 10);

        if (countBad <= 0) continue;

        const center = h3ToLatLon(hex);
        if (!center) continue;
        const { lat, lon } = center;
        const ratio = countBad / (countGood + countBad);

        parsed.push({
          id: hex,
          h3Index: hex,
          lat,
          lon,
          countGood,
          countBad,
          ratio,
        });
      }

      setZones(parsed);
      setCount("gpsJamming", parsed.length);
    } catch (err) {
      console.error("Failed to fetch GPS jamming data:", err);
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { zones, loading };
}
