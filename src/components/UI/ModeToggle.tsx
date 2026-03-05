import { usePlaybackStore } from "../../stores/usePlaybackStore";
import type { FlightData, MilitaryFlightData } from "../../types";

export function ModeToggle() {
  const mode = usePlaybackStore((s) => s.mode);
  const enterPlayback = usePlaybackStore((s) => s.enterPlayback);
  const exitPlayback = usePlaybackStore((s) => s.exitPlayback);

  function handleLive() {
    if (mode === "live") return;
    exitPlayback();
  }

  function handlePlayback() {
    if (mode === "playback") return;
    const flights =
      ((window as unknown as Record<string, unknown>).__latestFlights as FlightData[]) || [];
    const military =
      ((window as unknown as Record<string, unknown>).__latestMilitary as MilitaryFlightData[]) ||
      [];
    enterPlayback(flights, military);
  }

  return (
    <div className="flex items-center gap-0 bg-black/40 backdrop-blur-sm rounded-full border border-mil-teal/20 overflow-hidden pointer-events-auto">
      <button
        onClick={handleLive}
        className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold tracking-wider transition-all ${
          mode === "live"
            ? "text-mil-green bg-mil-green/10"
            : "text-mil-text-dim hover:text-mil-text"
        }`}
      >
        {mode === "live" && (
          <div className="w-2 h-2 rounded-full bg-mil-green animate-pulse" />
        )}
        LIVE
      </button>
      <div className="w-px h-4 bg-mil-teal/20" />
      <button
        onClick={handlePlayback}
        className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold tracking-wider transition-all ${
          mode === "playback"
            ? "text-mil-amber bg-mil-amber/10"
            : "text-mil-text-dim hover:text-mil-text"
        }`}
      >
        {mode === "playback" && (
          <div className="w-2 h-2 rounded-full bg-mil-amber animate-pulse" />
        )}
        PLAYBACK
      </button>
    </div>
  );
}
