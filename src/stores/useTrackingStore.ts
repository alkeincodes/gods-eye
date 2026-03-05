import { create } from "zustand";
import type { TrackedEntity } from "../types";

interface TrackingState {
  selectedEntity: TrackedEntity | null;
  entityPanelOpen: boolean;
  tracking: boolean;
  selectEntity: (entity: TrackedEntity) => void;
  clearSelection: () => void;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  selectedEntity: null,
  entityPanelOpen: false,
  tracking: false,
  selectEntity: (entity) => set({ selectedEntity: entity, entityPanelOpen: true, tracking: true }),
  clearSelection: () => set({ selectedEntity: null, entityPanelOpen: false, tracking: false }),
  startTracking: () => set({ tracking: true }),
  stopTracking: () => set({ tracking: false }),
}));

/**
 * Mutable screen-position written by layers every frame from Cesium's preRender.
 * Read by EntityInfo via rAF + direct DOM mutation — never goes through React state.
 */
export const entityScreenPos = { x: 0, y: 0, valid: false };
