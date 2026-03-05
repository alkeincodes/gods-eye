import { useState, useEffect, useCallback } from "react";
import { fetchJSON } from "../lib/api";
import { useLayerStore } from "../stores/useLayerStore";
import { API_URLS, REFRESH_INTERVALS } from "../lib/constants";
import { getCountryCentroid } from "../lib/countries";
import type { InternetOutage } from "../types";

export function useInternetOutages() {
  const [outages, setOutages] = useState<InternetOutage[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);

  const fetchOutages = useCallback(async () => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - 86400;
      const until = now;

      const res = await fetchJSON<{ data?: Array<{ id: number; entityCode: string; entityName?: string; from?: number; until?: number; score?: number; datasource?: string }> }>(
        `${API_URLS.IODA_OUTAGES}?entityType=country&from=${from}&until=${until}&limit=50`
      );

      const events = res?.data ?? [];
      const mapped: InternetOutage[] = [];

      for (const evt of events) {
        const centroid = getCountryCentroid(evt.entityCode);
        if (!centroid) continue;

        mapped.push({
          id: String(evt.id),
          country: evt.entityName ?? evt.entityCode,
          countryCode: evt.entityCode,
          lat: centroid.lat,
          lon: centroid.lon,
          score: evt.score ?? 0,
          startTime: evt.from ?? now,
          duration: (evt.until ?? now) - (evt.from ?? now),
          datasource: evt.datasource ?? "unknown",
        });
      }

      setOutages(mapped);
      setCount("internetOutages", mapped.length);
    } catch (err) {
      console.error("Failed to fetch internet outages:", err);
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    fetchOutages();
    const interval = setInterval(fetchOutages, REFRESH_INTERVALS.INTERNET_OUTAGES);
    return () => clearInterval(interval);
  }, [fetchOutages]);

  return { outages, loading };
}
