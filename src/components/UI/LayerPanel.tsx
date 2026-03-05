import { useLayerStore } from "../../stores/useLayerStore";
import { LAYER_CONFIG } from "../../lib/constants";
import type { LayerType } from "../../types";
import {
  Satellite,
  Plane,
  Shield,
  Activity,
  Map,
  Camera,
  Car,
  ScanEye,
  TriangleAlert,
  Ship,
  Ban,
  WifiOff,
  Twitter,
  Youtube,
  Github,
  Linkedin,
  Facebook,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Satellite,
  Plane,
  Shield,
  Activity,
  Map,
  Camera,
  Car,
  ScanEye,
  TriangleAlert,
  Ship,
  Ban,
  WifiOff,
};

export function LayerPanel() {
  const layers = useLayerStore((s) => s.layers);
  const counts = useLayerStore((s) => s.counts);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  const layerEntries = Object.entries(LAYER_CONFIG) as [
    LayerType,
    (typeof LAYER_CONFIG)[keyof typeof LAYER_CONFIG],
  ][];

  return (
    <div className="space-y-0.5">
      {layerEntries.map(([key, config]) => {
        const active = layers[key];
        const count = counts[key];
        const Icon = ICONS[config.icon];

        return (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-mono transition-all ${
              active
                ? "bg-white/5 text-mil-text"
                : "text-mil-text-dim hover:bg-white/5"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                active ? "opacity-100" : "opacity-30"
              }`}
              style={{ backgroundColor: config.color }}
            />
            {Icon && (
              <Icon
                size={11}
                className={active ? "opacity-80" : "opacity-30"}
              />
            )}
            <span className="flex-1 text-left">{config.label}</span>
            {count > 0 && active && (
              <span className="text-[9px] text-mil-text-dim">
                {count.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
      <div className="flex flex-col items-center gap-2 pt-4 mt-4 px-2 border-t border-white/10">
        <span className="text-[10px] font-mono text-mil-text-dim tracking-widest uppercase">Follow me</span>
        <div className="flex items-center gap-4">
          <a href="https://x.com/kanedev06" target="_blank" rel="noopener noreferrer" className="text-mil-text-dim hover:text-white transition-colors">
            <Twitter size={15} />
          </a>
          <a href="https://www.youtube.com/@KaneDev06" target="_blank" rel="noopener noreferrer" className="text-mil-text-dim hover:text-white transition-colors">
            <Youtube size={15} />
          </a>
          <a href="https://github.com/alkeincodes" target="_blank" rel="noopener noreferrer" className="text-mil-text-dim hover:text-white transition-colors">
            <Github size={15} />
          </a>
          <a href="https://www.linkedin.com/in/alkein-villajos-9520a017b/" target="_blank" rel="noopener noreferrer" className="text-mil-text-dim hover:text-white transition-colors">
            <Linkedin size={15} />
          </a>
          <a href="https://www.facebook.com/kanedev06" target="_blank" rel="noopener noreferrer" className="text-mil-text-dim hover:text-white transition-colors">
            <Facebook size={15} />
          </a>
        </div>
        <span className="text-[10px] font-mono text-mil-text-dim">Kane Dev</span>
      </div>
    </div>
  );
}
