import { useState, useEffect, useCallback } from "react";
import { fetchJSON } from "../lib/api";
import { useLayerStore } from "../stores/useLayerStore";
import { API_URLS } from "../lib/constants";
import type { TrafficSegment } from "../types";

interface OverpassResponse {
  elements: {
    id: number;
    type: string;
    geometry?: { lat: number; lon: number }[];
    tags?: { highway?: string };
  }[];
}

export function useTraffic(bbox?: {
  south: number;
  west: number;
  north: number;
  east: number;
}) {
  const [segments, setSegments] = useState<TrafficSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const setCount = useLayerStore((s) => s.setCount);

  const fetchTraffic = useCallback(async () => {
    if (!bbox) return;

    setLoading(true);
    const { south, west, north, east } = bbox;

    // Fetch motorways first (biggest roads)
    const query = `[out:json][timeout:25];way["highway"~"motorway|trunk|primary"](${south},${west},${north},${east});out geom;`;

    try {
      const data = await fetchJSON<OverpassResponse>(
        `${API_URLS.OVERPASS}?data=${encodeURIComponent(query)}`,
      );

      const parsed: TrafficSegment[] = data.elements
        .filter((el) => el.geometry && el.geometry.length > 1)
        .map((el) => ({
          id: String(el.id),
          coordinates: el.geometry!.map((g) => [g.lon, g.lat] as [number, number]),
          roadType: el.tags?.highway || "road",
        }));

      setSegments(parsed);
      setCount("traffic", parsed.length);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch traffic data:", err);
      setLoading(false);
    }
  }, [bbox, setCount]);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  return { segments, loading };
}
