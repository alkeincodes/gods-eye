import { GlobeViewer } from "./components/Globe/GlobeViewer";
import { Sidebar } from "./components/UI/Sidebar";
import { HudOverlay } from "./components/UI/HudOverlay";
import { ControlPanel } from "./components/UI/ControlPanel";
import { EntityInfo } from "./components/UI/EntityInfo";
import { BottomBar } from "./components/UI/BottomBar";
import { LandmarksBar } from "./components/UI/LandmarksBar";
import { PlaybackScrubber } from "./components/UI/PlaybackScrubber";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useViewStore } from "./stores/useViewStore";
import { usePlaybackStore } from "./stores/usePlaybackStore";

export default function App() {
  useKeyboardShortcuts();
  const cleanUi = useViewStore((s) => s.cleanUi);
  const playbackMode = usePlaybackStore((s) => s.mode);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-mil-bg font-mono">
      <GlobeViewer />
      {!cleanUi && <HudOverlay />}
      <Sidebar />
      <ControlPanel />
      <EntityInfo />
      <LandmarksBar />
      <BottomBar />
      {playbackMode === "playback" && <PlaybackScrubber />}
    </div>
  );
}
