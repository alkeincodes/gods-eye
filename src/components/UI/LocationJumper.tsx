import { useViewStore } from "../../stores/useViewStore";
import { CITIES } from "../../lib/landmarks";
import { flyToCityOverview, flyToLandmark } from "../../lib/cameraNavigation";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export function LocationJumper() {
  const cityIndex = useViewStore((s) => s.currentCityIndex);
  const landmarkIndex = useViewStore((s) => s.currentLandmarkIndex);
  const setCurrentCity = useViewStore((s) => s.setCurrentCity);
  const setCurrentLandmark = useViewStore((s) => s.setCurrentLandmark);

  const city = CITIES[cityIndex];
  if (!city) return null;

  function prevCity() {
    const idx = (cityIndex - 1 + CITIES.length) % CITIES.length;
    setCurrentCity(idx);
    flyToCityOverview(idx, 1.2);
  }

  function nextCity() {
    const idx = (cityIndex + 1) % CITIES.length;
    setCurrentCity(idx);
    flyToCityOverview(idx, 1.2);
  }

  return (
    <div>
      {/* City selector */}
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={prevCity}
          className="p-1 text-mil-text-dim hover:text-mil-teal transition-colors"
        >
          <ChevronLeft size={12} />
        </button>
        <div className="flex-1 text-center text-[10px] font-mono text-mil-text font-semibold">
          {city.name.toUpperCase()}
        </div>
          <button
            onClick={nextCity}
            className="p-1 text-mil-text-dim hover:text-mil-teal transition-colors"
          >
            <ChevronRight size={12} />
          </button>
          <button
            onClick={() => flyToCityOverview(cityIndex, 1.2)}
            className="px-2 py-1 text-[9px] text-mil-text-dim border border-mil-teal/20 rounded hover:text-mil-teal hover:border-mil-teal/40 transition-colors"
          >
            Exit Focus
          </button>
        </div>

      {/* Landmark buttons */}
      <div className="space-y-0.5">
        {city.landmarks.map((landmark, idx) => (
          <button
            key={landmark.name}
            onClick={() => {
              setCurrentLandmark(idx);
              flyToLandmark(cityIndex, idx, 1.5);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono transition-all ${
              idx === landmarkIndex
                ? "bg-mil-teal/10 text-mil-teal"
                : "text-mil-text-dim hover:text-mil-text hover:bg-white/5"
            }`}
          >
            <MapPin size={10} />
            <span>{landmark.name}</span>
            <span className="ml-auto text-[8px] opacity-50">
              {["Q", "W", "E", "R", "T"][idx]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
