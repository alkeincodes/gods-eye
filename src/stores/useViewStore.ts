import { create } from "zustand";
import type { VisualMode, ShaderParams } from "../types";

interface ViewState {
  mode: VisualMode;
  sidebarOpen: boolean;
  currentCityIndex: number;
  currentLandmarkIndex: number;
  shaderParams: ShaderParams;
  cleanUi: boolean;
  leftSidebarSections: Record<string, boolean>;
  rightPanelOpen: boolean;
  setMode: (mode: VisualMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentCity: (index: number) => void;
  setCurrentLandmark: (index: number) => void;
  setShaderParam: <K extends keyof ShaderParams>(key: K, value: ShaderParams[K]) => void;
  toggleCleanUi: () => void;
  toggleSidebarSection: (section: string) => void;
  setRightPanelOpen: (open: boolean) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  mode: "normal",
  sidebarOpen: true,
  currentCityIndex: 0,
  currentLandmarkIndex: 0,
  shaderParams: {
    bloom: 50,
    sharpen: 0,
    pixelation: 0,
    distortion: 0,
    instability: 0,
    density: 1,
  },
  cleanUi: false,
  leftSidebarSections: {
    cctv: false,
    layers: true,
    scenes: false,
  },
  rightPanelOpen: false,
  setMode: (mode) => set({ mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentCity: (index) =>
    set({ currentCityIndex: index, currentLandmarkIndex: 0 }),
  setCurrentLandmark: (index) => set({ currentLandmarkIndex: index }),
  setShaderParam: (key, value) =>
    set((state) => ({
      shaderParams: { ...state.shaderParams, [key]: value },
    })),
  toggleCleanUi: () => set((state) => ({ cleanUi: !state.cleanUi })),
  toggleSidebarSection: (section) =>
    set((state) => ({
      leftSidebarSections: {
        ...state.leftSidebarSections,
        [section]: !state.leftSidebarSections[section],
      },
    })),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
}));
