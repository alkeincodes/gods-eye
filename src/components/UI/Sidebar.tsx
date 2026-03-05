import { useViewStore } from "../../stores/useViewStore";
import { LayerPanel } from "./LayerPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";

function AccordionSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const open = useViewStore((s) => s.leftSidebarSections[id] ?? false);
  const toggle = useViewStore((s) => s.toggleSidebarSection);

  return (
    <div className="border-b border-mil-teal/10 last:border-b-0">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-mil-teal/70 tracking-wider hover:text-mil-teal transition-colors"
      >
        <span>{title}</span>
        <span className="text-mil-text-dim">{open ? "[-]" : "[+]"}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function Sidebar() {
  const sidebarOpen = useViewStore((s) => s.sidebarOpen);
  const toggleSidebar = useViewStore((s) => s.toggleSidebar);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-28 left-3 z-50 p-1.5 bg-black/60 border border-mil-teal/20 rounded-lg text-mil-text-dim hover:text-mil-teal transition-colors backdrop-blur-sm"
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Floating sidebar panel */}
      <div
        className={`fixed top-36 left-3 w-56 max-h-[calc(100vh-200px)] bg-black/50 backdrop-blur-md border border-mil-teal/15 rounded-xl z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden shadow-lg shadow-black/40 ${
          sidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-[calc(100%+20px)] opacity-0"
        }`}
      >
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-mil-teal/10">
          <div className="text-[9px] text-mil-teal/60 tracking-[0.25em] font-semibold">
            DATA LAYERS
          </div>
        </div>

        <AccordionSection id="cctv" title="CCTV MESH">
          <div className="text-[10px] text-mil-text-dim">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-mil-amber" />
              <span>No active CCTV feeds</span>
            </div>
            <div className="text-[9px] text-mil-text-dim/50">
              Enable CCTV layer to view camera feeds
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="layers" title="LAYER CONTROL">
          <LayerPanel />
        </AccordionSection>

        {/* Footer */}
        <div className="px-3 py-2.5 border-t border-mil-teal/10">
          <div className="text-[9px] text-mil-text-dim leading-relaxed">
            <div className="text-mil-teal/50 mb-1">SHORTCUTS</div>
            <div className="space-y-0.5">
              <div>
                <span className="text-mil-teal">1-4</span> Visual modes
              </div>
              <div>
                <span className="text-mil-teal">Q/W/E/R/T</span> Landmarks
              </div>
              <div>
                <span className="text-mil-teal">[ / ]</span> Cycle cities
              </div>
              <div>
                <span className="text-mil-teal">0</span> Exit focus
              </div>
              <div>
                <span className="text-mil-teal">H</span> Toggle HUD
              </div>
              <div>
                <span className="text-mil-teal">ESC</span> Deselect
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
