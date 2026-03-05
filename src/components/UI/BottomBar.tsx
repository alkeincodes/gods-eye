import { useState, useEffect } from "react";
import { useLayerStore } from "../../stores/useLayerStore";
import { usePlaybackStore } from "../../stores/usePlaybackStore";
import { LAYER_CONFIG } from "../../lib/constants";
import type { LayerType } from "../../types";

export function BottomBar() {
  const playbackMode = usePlaybackStore((s) => s.mode);
  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (playbackMode === "playback") return null;

  const timestamp = time.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const layerEntries = Object.entries(LAYER_CONFIG) as [
    LayerType,
    (typeof LAYER_CONFIG)[keyof typeof LAYER_CONFIG],
  ][];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/50 backdrop-blur-sm border-t border-mil-teal/10 z-30 flex items-center px-3 font-mono">
      {/* Left: Layer filter chips */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
        {layerEntries.map(([key, config]) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-wider whitespace-nowrap transition-all border ${
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

      {/* Right: UTC timestamp */}
      <div className="text-[9px] text-mil-text-dim tracking-wider ml-4 whitespace-nowrap">
        {timestamp}
      </div>
    </div>
  );
}
