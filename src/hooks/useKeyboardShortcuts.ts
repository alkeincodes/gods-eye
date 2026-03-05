import { useEffect } from "react";
import { useViewStore } from "../stores/useViewStore";
import { useTrackingStore } from "../stores/useTrackingStore";
import { usePlaybackStore } from "../stores/usePlaybackStore";
import { CITIES } from "../lib/landmarks";
import { flyToLandmark, flyToCityOverview } from "../lib/cameraNavigation";
import type { VisualMode } from "../types";

const MODE_KEYS: Record<string, VisualMode> = {
  "1": "normal",
  "2": "crt",
  "3": "nightVision",
  "4": "flir",
};

const LANDMARK_KEYS = ["q", "w", "e", "r", "t"];

export function useKeyboardShortcuts() {
  const setMode = useViewStore((s) => s.setMode);
  const clearSelection = useTrackingStore((s) => s.clearSelection);
  const currentCityIndex = useViewStore((s) => s.currentCityIndex);
  const setCurrentCity = useViewStore((s) => s.setCurrentCity);
  const setCurrentLandmark = useViewStore((s) => s.setCurrentLandmark);
  const toggleCleanUi = useViewStore((s) => s.toggleCleanUi);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Space: toggle play/pause in playback mode
      if (e.key === " ") {
        const { mode } = usePlaybackStore.getState();
        if (mode === "playback") {
          e.preventDefault();
          usePlaybackStore.getState().togglePlaying();
          return;
        }
      }

      // Toggle clean UI: H
      if (key === "h") {
        toggleCleanUi();
        return;
      }

      // Visual mode switching: 1-4
      if (MODE_KEYS[key]) {
        setMode(MODE_KEYS[key]);
        return;
      }

      // Landmark jumping: Q/W/E/R/T
      const landmarkIdx = LANDMARK_KEYS.indexOf(key);
      if (landmarkIdx !== -1) {
        setCurrentLandmark(landmarkIdx);
        flyToLandmark(currentCityIndex, landmarkIdx, 1.5);
        return;
      }

      // Zoom out / exit focused landmark view
      if (key === "0") {
        flyToCityOverview(currentCityIndex, 1.2);
        return;
      }

      // City cycling: [ and ]
      if (key === "[") {
        const newIdx =
          (currentCityIndex - 1 + CITIES.length) % CITIES.length;
        setCurrentCity(newIdx);
        flyToCityOverview(newIdx, 1.2);
        return;
      }
      if (key === "]") {
        const newIdx = (currentCityIndex + 1) % CITIES.length;
        setCurrentCity(newIdx);
        flyToCityOverview(newIdx, 1.2);
        return;
      }

      // Escape: deselect / close panels
      if (key === "escape") {
        clearSelection();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMode, clearSelection, currentCityIndex, setCurrentCity, setCurrentLandmark, toggleCleanUi]);
}
