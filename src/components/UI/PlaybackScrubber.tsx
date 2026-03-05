import { useEffect, useRef, useCallback } from "react";
import { Pause, Play } from "lucide-react";
import { usePlaybackStore } from "../../stores/usePlaybackStore";
import { useLayerStore } from "../../stores/useLayerStore";
import { LAYER_CONFIG } from "../../lib/constants";
import { startPlaybackLoop } from "../../lib/playbackLoop";
import type { EarthquakeData, LayerType, PlaybackSpeed } from "../../types";

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 1, label: "1m/s" },
  { value: 3, label: "3m/s" },
  { value: 5, label: "5m/s" },
  { value: 15, label: "15m/s" },
  { value: 60, label: "1h/s" },
];

function getEarthquakes(): EarthquakeData[] {
  return (
    ((window as unknown as Record<string, unknown>).__latestEarthquakes as EarthquakeData[]) || []
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function PlaybackScrubber() {
  const playing = usePlaybackStore((s) => s.playing);
  const speed = usePlaybackStore((s) => s.speed);
  const playbackTime = usePlaybackStore((s) => s.playbackTime);
  const rangeStart = usePlaybackStore((s) => s.rangeStart);
  const rangeEnd = usePlaybackStore((s) => s.rangeEnd);
  const togglePlaying = usePlaybackStore((s) => s.togglePlaying);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);
  const setPlaybackTime = usePlaybackStore((s) => s.setPlaybackTime);
  const setRafId = usePlaybackStore((s) => s.setRafId);

  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  const lastFrameRef = useRef<number | null>(null);

  const tick = useCallback(
    (timestamp: number) => {
      if (lastFrameRef.current !== null) {
        const dtReal = (timestamp - lastFrameRef.current) / 1000;
        const { playbackTime: pt, rangeEnd: re, speed: spd } = usePlaybackStore.getState();
        const dtSim = dtReal * spd * 60;
        const newTime = Math.min(pt + dtSim * 1000, re);
        setPlaybackTime(newTime);

        if (newTime >= re) {
          usePlaybackStore.getState().togglePlaying();
          lastFrameRef.current = null;
          return;
        }
      }
      lastFrameRef.current = timestamp;
    },
    [setPlaybackTime],
  );

  useEffect(() => {
    if (playing) {
      lastFrameRef.current = null;
      const stop = startPlaybackLoop({
        isPlaying: () => usePlaybackStore.getState().playing,
        onFrame: tick,
        setHandle: setRafId,
      });
      return () => {
        stop();
        lastFrameRef.current = null;
      };
    } else {
      const { rafId } = usePlaybackStore.getState();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setRafId(null);
      lastFrameRef.current = null;
    }
  }, [playing, tick, setRafId]);

  const earthquakes = getEarthquakes();
  const layerEntries = Object.entries(LAYER_CONFIG) as [
    LayerType,
    (typeof LAYER_CONFIG)[keyof typeof LAYER_CONFIG],
  ][];

  const sliderPercent =
    rangeEnd > rangeStart
      ? ((playbackTime - rangeStart) / (rangeEnd - rangeStart)) * 100
      : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-sm border-t border-mil-amber/20 font-mono select-none">
      {/* Row 1: Play + Slider + Speed + Time */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Play/Pause */}
        <button
          onClick={togglePlaying}
          className="text-mil-amber hover:text-mil-amber/80 transition-colors pointer-events-auto shrink-0"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Slider track */}
        <div className="relative flex-1 h-6 flex items-center pointer-events-auto">
          <input
            type="range"
            min={rangeStart}
            max={rangeEnd}
            value={playbackTime}
            onChange={(e) => setPlaybackTime(Number(e.target.value))}
            className="playback-slider w-full h-1 bg-mil-amber/20 rounded-full appearance-none cursor-pointer"
          />
          {/* Earthquake markers */}
          {earthquakes.map((eq) => {
            const pct =
              rangeEnd > rangeStart
                ? ((eq.time - rangeStart) / (rangeEnd - rangeStart)) * 100
                : 0;
            if (pct < 0 || pct > 100) return null;
            return (
              <div
                key={eq.id}
                className="absolute w-1.5 h-1.5 rounded-full bg-mil-red pointer-events-none"
                style={{
                  left: `${pct}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                title={`M${eq.magnitude} - ${eq.place}`}
              />
            );
          })}
        </div>

        {/* Speed chips */}
        <div className="flex items-center gap-1 shrink-0">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`px-2 py-0.5 rounded text-[9px] tracking-wider transition-all pointer-events-auto border ${
                speed === opt.value
                  ? "border-mil-amber bg-mil-amber/15 text-mil-amber"
                  : "border-mil-text-dim/20 text-mil-text-dim hover:text-mil-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Time display */}
        <div className="text-[9px] text-mil-amber tracking-wider whitespace-nowrap shrink-0 min-w-[160px] text-right">
          {formatTime(playbackTime)}
        </div>
      </div>

      {/* Row 2: Layer chips */}
      <div className="flex items-center justify-center gap-1.5 px-3 pb-2">
        {layerEntries.map(([key, config]) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-wider whitespace-nowrap transition-all border pointer-events-auto ${
                active
                  ? "border-current bg-current/10"
                  : "border-mil-text-dim/20 text-mil-text-dim/40 hover:text-mil-text-dim"
              }`}
              style={active ? { color: config.color } : undefined}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: active ? config.color : "#666",
                  opacity: active ? 1 : 0.3,
                }}
              />
              {config.label.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
