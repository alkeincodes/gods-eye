import { create } from "zustand";
import type { FlightData, MilitaryFlightData, PlaybackSpeed } from "../types";

interface PlaybackState {
  mode: "live" | "playback";
  playbackTime: number;
  rangeStart: number;
  rangeEnd: number;
  playing: boolean;
  speed: PlaybackSpeed;
  snapshotFlights: FlightData[];
  snapshotMilitary: MilitaryFlightData[];
  snapshotTime: number;
  rafId: number | null;

  enterPlayback: (flights: FlightData[], military: MilitaryFlightData[]) => void;
  exitPlayback: () => void;
  togglePlaying: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setPlaybackTime: (time: number) => void;
  setRafId: (id: number | null) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  mode: "live",
  playbackTime: 0,
  rangeStart: 0,
  rangeEnd: 0,
  playing: false,
  speed: 1,
  snapshotFlights: [],
  snapshotMilitary: [],
  snapshotTime: 0,
  rafId: null,

  enterPlayback: (flights, military) => {
    const now = Date.now();
    set({
      mode: "playback",
      playbackTime: now,
      rangeStart: now - 24 * 60 * 60 * 1000,
      rangeEnd: now,
      playing: false,
      snapshotFlights: flights,
      snapshotMilitary: military,
      snapshotTime: now,
    });
  },

  exitPlayback: () => {
    const { rafId } = get();
    if (rafId !== null) cancelAnimationFrame(rafId);
    set({
      mode: "live",
      playing: false,
      snapshotFlights: [],
      snapshotMilitary: [],
      rafId: null,
    });
  },

  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setSpeed: (speed) => set({ speed }),
  setPlaybackTime: (time) => set({ playbackTime: time }),
  setRafId: (id) => set({ rafId: id }),
}));
