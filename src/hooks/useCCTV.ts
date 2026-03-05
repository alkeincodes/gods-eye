import { useState, useEffect, useCallback } from "react";
import { useLayerStore } from "../stores/useLayerStore";
import type { CCTVCamera } from "../types";

// Austin TX DOT cameras as a starting dataset
const AUSTIN_CAMERAS: CCTVCamera[] = [
  {
    id: "atx-001",
    name: "I-35 @ Riverside",
    lat: 30.2533,
    lon: -97.7382,
    imageUrl:
      "https://its.txdot.gov/its/DistrictInfo/camImage/620/cctv_620_62024_AUS.jpg",
    city: "Austin",
  },
  {
    id: "atx-002",
    name: "I-35 @ 51st St",
    lat: 30.3086,
    lon: -97.7226,
    imageUrl:
      "https://its.txdot.gov/its/DistrictInfo/camImage/620/cctv_620_62050_AUS.jpg",
    city: "Austin",
  },
  {
    id: "atx-003",
    name: "MoPac @ 290",
    lat: 30.2271,
    lon: -97.7876,
    imageUrl:
      "https://its.txdot.gov/its/DistrictInfo/camImage/620/cctv_620_62090_AUS.jpg",
    city: "Austin",
  },
  {
    id: "atx-004",
    name: "I-35 @ Ben White",
    lat: 30.2304,
    lon: -97.7457,
    imageUrl:
      "https://its.txdot.gov/its/DistrictInfo/camImage/620/cctv_620_62020_AUS.jpg",
    city: "Austin",
  },
  {
    id: "atx-005",
    name: "US-183 @ Burnet",
    lat: 30.3676,
    lon: -97.7244,
    imageUrl:
      "https://its.txdot.gov/its/DistrictInfo/camImage/620/cctv_620_62130_AUS.jpg",
    city: "Austin",
  },
];

export function useCCTV() {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const setCount = useLayerStore((s) => s.setCount);

  const loadCameras = useCallback(() => {
    setCameras(AUSTIN_CAMERAS);
    setCount("cctv", AUSTIN_CAMERAS.length);
    setLoading(false);
  }, [setCount]);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  return { cameras, loading };
}
