import { useCesium } from "resium";
import { useEffect, useRef } from "react";
import { PostProcessStage } from "cesium";
import { useViewStore } from "../../stores/useViewStore";
import { crtShader } from "../../shaders/crt";
import { nightVisionShader } from "../../shaders/nightVision";
import { flirShader } from "../../shaders/flir";

export function PostProcessing() {
  const { viewer } = useCesium();
  const mode = useViewStore((s) => s.mode);
  const stageRef = useRef<PostProcessStage | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const stages = viewer.scene.postProcessStages;

    // Remove only our previously-added stage (not all stages)
    if (stageRef.current) {
      stages.remove(stageRef.current);
      stageRef.current = null;
    }

    if (mode === "normal") return;

    let shader: string | null = null;
    if (mode === "crt") shader = crtShader;
    if (mode === "nightVision") shader = nightVisionShader;
    if (mode === "flir") shader = flirShader;

    if (!shader) return;

    const stage = new PostProcessStage({
      fragmentShader: shader,
      uniforms: {
        u_time: () => performance.now() / 1000.0,
      },
    });

    stageRef.current = stage;
    stages.add(stage);

    return () => {
      if (!viewer.isDestroyed() && stageRef.current) {
        stages.remove(stageRef.current);
        stageRef.current = null;
      }
    };
  }, [viewer, mode]);

  return null;
}
