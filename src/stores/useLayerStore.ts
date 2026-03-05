import { create } from "zustand";
import type { LayerType } from "../types";

interface LayerState {
  layers: Record<LayerType, boolean>;
  counts: Record<LayerType, number>;
  toggleLayer: (layer: LayerType) => void;
  setLayerVisible: (layer: LayerType, visible: boolean) => void;
  setCount: (layer: LayerType, count: number) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: {
    satellites: true,
    flights: true,
    military: true,
    earthquakes: true,
    countryLabels: true,
    cctv: false,
    traffic: false,
    surveillance: false,
    gpsJamming: false,
    ais: false,
    airspace: false,
    internetOutages: false,
  },
  counts: {
    satellites: 0,
    flights: 0,
    military: 0,
    earthquakes: 0,
    countryLabels: 0,
    cctv: 0,
    traffic: 0,
    surveillance: 0,
    gpsJamming: 0,
    ais: 0,
    airspace: 0,
    internetOutages: 0,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setLayerVisible: (layer, visible) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: visible },
    })),
  setCount: (layer, count) =>
    set((state) => ({
      counts: { ...state.counts, [layer]: count },
    })),
}));
