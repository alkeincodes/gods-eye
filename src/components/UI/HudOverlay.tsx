import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useViewStore } from "../../stores/useViewStore";
import { useLayerStore } from "../../stores/useLayerStore";
import { useCameraPosition } from "../../hooks/useCameraPosition";
import { toDMS, estimateGSD, estimateSunAngle } from "../../lib/coordinates";
import { VISUAL_MODES } from "../../lib/constants";
import { CITIES } from "../../lib/landmarks";
import { ModeToggle } from "./ModeToggle";

function useUtcClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function HudOverlay() {
  const mode = useViewStore((s) => s.mode);
  const cityIndex = useViewStore((s) => s.currentCityIndex);
  const layers = useLayerStore((s) => s.layers);
  const counts = useLayerStore((s) => s.counts);
  const density = useViewStore((s) => s.shaderParams.density);
  const cam = useCameraPosition();
  const utc = useUtcClock();

  const modeConfig = VISUAL_MODES[mode];
  const city = CITIES[cityIndex];
  const activeLayerCount = Object.values(layers).filter(Boolean).length;
  const totalEntities = Object.values(counts).reduce((a, b) => a + b, 0);
  const timestamp = utc.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const sunAngle = estimateSunAngle();

  return (
    <div className="fixed inset-0 z-30 pointer-events-none font-mono select-none">
      {/* ── Top-Left ── */}
      <div className="absolute top-3 left-3 space-y-0.5">
        <div className="text-[9px] text-mil-text-dim tracking-widest">
          VIS:{activeLayerCount} SRC:{totalEntities.toLocaleString()} DENS:{density.toFixed(1)}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Eye size={14} className="text-mil-teal" />
          <span className="text-mil-teal text-xs font-bold tracking-[0.2em]">
            GOD&apos;S EYE
          </span>
        </div>
        <div className="text-[8px] text-mil-text-dim tracking-[0.25em]">
          GLOBAL OMNISCIENT DEFENSE SYSTEM
        </div>
        <div className="text-[9px] text-mil-amber font-semibold tracking-wider mt-1">
          TOP SECRET // SI-TK // NOFORN
        </div>
        <div className="text-[9px] text-mil-text-dim tracking-wider">
          KH11-4166 OPS-4117
        </div>
        <div className="text-[20px] text-mil-teal font-bold tracking-wider mt-1 leading-tight">
          {modeConfig.shortLabel}
        </div>
        {city && (
          <div className="text-[10px] text-mil-text-dim tracking-wider">
            {city.name.toUpperCase()} &middot; {activeLayerCount} FEEDS
          </div>
        )}
      </div>

      {/* ── Top-Center ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2">
        <ModeToggle />
      </div>

      {/* ── Top-Right ── */}
      <div className="absolute top-3 right-3 text-right space-y-0.5">
        <div className="text-[9px] text-mil-text-dim tracking-wider">
          ACTIVE STYLE
        </div>
        <div className="text-[20px] text-mil-teal font-bold tracking-wider leading-tight">
          {modeConfig.shortLabel}
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <span className="text-mil-red font-bold text-[10px] animate-blink-rec">
            ● REC
          </span>
          <span className="text-[10px] text-mil-text-dim tracking-wider">
            {timestamp}
          </span>
        </div>
        <div className="text-[9px] text-mil-text-dim tracking-wider mt-0.5">
          ORB: 47439 PASS: DESC-179
        </div>
      </div>

      {/* ── Bottom-Left ── */}
      <div className="absolute bottom-14 left-3 space-y-0.5">
        <div className="text-[10px] text-mil-teal tracking-wider">
          {toDMS(cam.lat, true)} {toDMS(cam.lon, false)}
        </div>
        <div className="text-[9px] text-mil-text-dim tracking-wider">
          MGRS: 18SUJ 23456 12345
        </div>
      </div>

      {/* ── Bottom-Right ── */}
      <div className="absolute bottom-14 right-3 text-right space-y-0.5">
        <div className="text-[10px] text-mil-text-dim tracking-wider">
          GSD: {estimateGSD(cam.altMeters)}M NIIRS: 0.0
        </div>
        <div className="text-[10px] text-mil-text-dim tracking-wider">
          ALT: {Math.round(cam.altMeters).toLocaleString()}M SUN: {sunAngle}° EL
        </div>
      </div>
    </div>
  );
}
