import { useViewStore } from "../../stores/useViewStore";
import { useLayerStore } from "../../stores/useLayerStore";
import { VISUAL_MODES, LAYER_CONFIG } from "../../lib/constants";
import { Slider } from "./controls/Slider";
import { Settings, X } from "lucide-react";
import type { VisualMode, LayerType } from "../../types";

const MODES = Object.entries(VISUAL_MODES) as [
  VisualMode,
  (typeof VISUAL_MODES)[keyof typeof VISUAL_MODES],
][];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-mil-teal/10 bg-black/20 rounded p-3 space-y-2">
      <div className="text-[9px] text-mil-teal/60 tracking-widest">{title}</div>
      {children}
    </div>
  );
}

export function ControlPanel() {
  const open = useViewStore((s) => s.rightPanelOpen);
  const setOpen = useViewStore((s) => s.setRightPanelOpen);
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  const shaderParams = useViewStore((s) => s.shaderParams);
  const setShaderParam = useViewStore((s) => s.setShaderParam);
  const cleanUi = useViewStore((s) => s.cleanUi);
  const toggleCleanUi = useViewStore((s) => s.toggleCleanUi);
  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-36 right-3 z-50 p-1.5 bg-black/50 border border-mil-teal/20 rounded text-mil-text-dim hover:text-mil-teal transition-colors"
        title="Control Panel"
      >
        <Settings size={14} />
      </button>

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-black/40 backdrop-blur-sm border-l border-mil-teal/20 z-40 transition-transform duration-300 overflow-y-auto pt-44 pb-14 px-3 space-y-2 pointer-events-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button inside panel */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-36 right-3 p-1 text-mil-text-dim hover:text-mil-teal transition-colors"
        >
          <X size={12} />
        </button>

        {/* VISUAL MODE */}
        <Section title="VISUAL MODE">
          <div className="grid grid-cols-4 gap-1">
            {MODES.map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-1.5 py-1.5 rounded text-[10px] font-mono transition-all ${
                  mode === key
                    ? "bg-mil-teal/20 text-mil-teal border border-mil-teal/30"
                    : "bg-white/5 text-mil-text-dim border border-transparent hover:border-mil-teal/10"
                }`}
              >
                {config.shortLabel}
              </button>
            ))}
          </div>
        </Section>

        {/* BLOOM */}
        <Section title="BLOOM">
          <Slider
            label="Intensity"
            value={shaderParams.bloom}
            onChange={(v) => setShaderParam("bloom", v)}
          />
        </Section>

        {/* SHARPEN */}
        <Section title="SHARPEN">
          <Slider
            label="Amount"
            value={shaderParams.sharpen}
            unit="%"
            onChange={(v) => setShaderParam("sharpen", v)}
          />
        </Section>

        {/* HUD */}
        <Section title="HUD">
          <div className="text-[10px] text-mil-text-dim flex justify-between">
            <span>Layout</span>
            <span className="text-mil-teal">Tactical</span>
          </div>
        </Section>

        {/* PANOPTIC */}
        <Section title="PANOPTIC">
          <Slider
            label="Density"
            value={shaderParams.density}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => setShaderParam("density", v)}
          />
          <div className="space-y-1 mt-1">
            {(Object.entries(LAYER_CONFIG) as [LayerType, (typeof LAYER_CONFIG)[LayerType]][]).map(
              ([key, config]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-[10px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => toggleLayer(key)}
                    className="accent-[#00d4aa] w-3 h-3"
                  />
                  <span
                    className={
                      layers[key] ? "text-mil-text" : "text-mil-text-dim"
                    }
                  >
                    {config.label}
                  </span>
                </label>
              ),
            )}
          </div>
        </Section>

        {/* CLEAN UI */}
        <Section title="CLEAN UI">
          <button
            onClick={toggleCleanUi}
            className={`w-full py-1.5 rounded text-[10px] font-mono transition-all ${
              cleanUi
                ? "bg-mil-teal/20 text-mil-teal border border-mil-teal/30"
                : "bg-white/5 text-mil-text-dim border border-mil-teal/10"
            }`}
          >
            {cleanUi ? "ON" : "OFF"}
          </button>
        </Section>

        {/* PARAMETERS */}
        <Section title="PARAMETERS">
          <Slider
            label="Pixelation"
            value={shaderParams.pixelation}
            onChange={(v) => setShaderParam("pixelation", v)}
          />
          <Slider
            label="Distortion"
            value={shaderParams.distortion}
            onChange={(v) => setShaderParam("distortion", v)}
          />
          <Slider
            label="Instability"
            value={shaderParams.instability}
            onChange={(v) => setShaderParam("instability", v)}
          />
        </Section>
      </div>
    </>
  );
}
