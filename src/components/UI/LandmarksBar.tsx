import { useViewStore } from "../../stores/useViewStore";
import { usePlaybackStore } from "../../stores/usePlaybackStore";
import { CITIES } from "../../lib/landmarks";
import { flyToCityOverview, flyToLandmark } from "../../lib/cameraNavigation";
import { MapPin, Navigation } from "lucide-react";

export function LandmarksBar() {
  const cityIndex = useViewStore((s) => s.currentCityIndex);
  const landmarkIndex = useViewStore((s) => s.currentLandmarkIndex);
  const setCurrentCity = useViewStore((s) => s.setCurrentCity);
  const setCurrentLandmark = useViewStore((s) => s.setCurrentLandmark);
  const playbackMode = usePlaybackStore((s) => s.mode);

  const city = CITIES[cityIndex];
  if (!city) return null;

  function selectCity(idx: number) {
    setCurrentCity(idx);
    flyToCityOverview(idx, 1.2);
  }

  function selectLandmark(idx: number) {
    setCurrentLandmark(idx);
    flyToLandmark(cityIndex, idx, 1.5);
  }

  return (
    <div
      className={`fixed ${
        playbackMode === "playback" ? "bottom-24" : "bottom-12"
      } left-1/2 -translate-x-1/2 z-40 w-fit max-w-[90vw]`}
    >
      <div className="bg-black/60 backdrop-blur-md border border-mil-teal/15 rounded-xl overflow-hidden shadow-lg shadow-black/50">
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 pt-2.5 pb-1.5 border-b border-mil-teal/10">
          <div className="flex items-center gap-2">
            <Navigation size={11} className="text-mil-teal/60" />
            <span className="text-[9px] text-mil-teal/60 tracking-[0.25em] font-semibold">
              LOCATIONS
            </span>
          </div>
          <button
            onClick={() => flyToCityOverview(cityIndex, 1.2)}
            className="absolute right-2 px-2 py-0.5 rounded border border-mil-teal/20 text-[9px] text-mil-text-dim hover:text-mil-teal hover:border-mil-teal/40 transition-colors"
            title="Exit focused landmark view"
          >
            EXIT FOCUS
          </button>
        </div>

        {/* Landmark buttons */}
        <div className="px-3 py-2">
          <div className="flex justify-center gap-1.5 overflow-x-auto scrollbar-hide">
            {city.landmarks.map((landmark, idx) => (
              <button
                key={landmark.name}
                onClick={() => selectLandmark(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-all border ${
                  idx === landmarkIndex
                    ? "border-mil-teal bg-mil-teal/10 text-mil-teal"
                    : "border-mil-teal/10 text-mil-text-dim hover:text-mil-text hover:border-mil-teal/30 bg-white/5"
                }`}
              >
                <MapPin size={9} />
                {landmark.name}
                <span className="text-[8px] opacity-40 ml-0.5">
                  {["Q", "W", "E", "R", "T"][idx]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* City tabs */}
        <div className="px-3 pb-2.5">
          <div className="flex justify-center gap-1.5 overflow-x-auto scrollbar-hide">
            {CITIES.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => selectCity(idx)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-all border ${
                  idx === cityIndex
                    ? "border-mil-teal/40 bg-white/10 text-mil-text font-semibold"
                    : "border-transparent text-mil-text-dim hover:text-mil-text hover:bg-white/5"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
