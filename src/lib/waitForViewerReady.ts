import type { Viewer as CesiumViewer } from "cesium";

type GetViewer = () => CesiumViewer | null | undefined;

export function waitForViewerReady(
  getViewer: GetViewer,
  onReady: (viewer: CesiumViewer) => void,
  intervalMs: number = 100,
): () => void {
  let disposed = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const tryResolveViewer = () => {
    if (disposed) return true;

    const viewer = getViewer();
    if (!viewer) return false;

    onReady(viewer);
    return true;
  };

  if (!tryResolveViewer()) {
    timer = setInterval(() => {
      if (tryResolveViewer() && timer) {
        clearInterval(timer);
        timer = null;
      }
    }, intervalMs);
  }

  return () => {
    disposed = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
