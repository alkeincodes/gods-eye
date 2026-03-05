import { useEffect, useRef } from "react";
import { useTrackingStore, entityScreenPos } from "../../stores/useTrackingStore";
import { X, Crosshair, CircleOff } from "lucide-react";
import { LAYER_CONFIG } from "../../lib/constants";

export function EntityInfo() {
  const entity = useTrackingStore((s) => s.selectedEntity);
  const panelOpen = useTrackingStore((s) => s.entityPanelOpen);
  const tracking = useTrackingStore((s) => s.tracking);
  const clearSelection = useTrackingStore((s) => s.clearSelection);
  const startTracking = useTrackingStore((s) => s.startTracking);
  const stopTracking = useTrackingStore((s) => s.stopTracking);
  const containerRef = useRef<HTMLDivElement>(null);

  // When NOT tracking: rAF loop reads mutable entityScreenPos and positions via DOM
  // When tracking: entity is at screen center, so we use pure CSS (left:50%, top:50%)
  useEffect(() => {
    if (!entity || !panelOpen || tracking) return;

    let rafId: number;
    const update = () => {
      const el = containerRef.current;
      if (el && entityScreenPos.valid) {
        el.style.left = `${entityScreenPos.x}px`;
        el.style.top = `${entityScreenPos.y}px`;
        el.style.display = "";
      } else if (el) {
        el.style.display = "none";
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      entityScreenPos.valid = false;
    };
  }, [entity, panelOpen, tracking]);

  if (!entity || !panelOpen) return null;

  const layerConfig = LAYER_CONFIG[entity.type];

  // When tracking, fixed at screen center. Otherwise positioned by rAF loop.
  const positionStyle = tracking
    ? { left: "50%", top: "50%", display: "" }
    : { display: "none" as const };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 pointer-events-none"
      style={{
        ...positionStyle,
        transform: "translate(-50%, -100%) translateY(-24px)",
      }}
    >
      <div className="pointer-events-auto bg-black/80 backdrop-blur-sm border border-mil-teal/30 rounded px-3 py-2 min-w-[200px] max-w-[280px]">
        {/* Header row: type badge + name + close */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: layerConfig.color }}
            />
            <span
              className="text-xs font-mono font-semibold truncate"
              style={{ color: layerConfig.color }}
            >
              {entity.name}
            </span>
          </div>
          <button
            onClick={clearSelection}
            className="p-0.5 text-mil-text-dim hover:text-mil-text transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        </div>

        {/* Data fields — compact inline layout */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1.5">
          {Object.entries(entity.data).map(([key, value]) => (
            <div key={key} className="text-[10px] font-mono whitespace-nowrap">
              <span className="text-mil-text-dim uppercase">{key} </span>
              <span className="text-mil-text">{String(value)}</span>
            </div>
          ))}
        </div>

        {/* Track / Stop Tracking */}
        <button
          onClick={tracking ? stopTracking : startTracking}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase transition-colors w-full justify-center ${
            tracking
              ? "bg-mil-teal/20 text-mil-teal border border-mil-teal/40 hover:bg-mil-teal/30"
              : "bg-white/5 text-mil-text-dim border border-white/10 hover:bg-white/10 hover:text-mil-text"
          }`}
        >
          {tracking ? <CircleOff size={10} /> : <Crosshair size={10} />}
          {tracking ? "Stop Tracking" : "Track"}
        </button>
      </div>

      {/* Connector line pointing down to entity */}
      <div className="flex justify-center">
        <div className="w-px h-3 bg-mil-teal/40" />
      </div>
    </div>
  );
}
