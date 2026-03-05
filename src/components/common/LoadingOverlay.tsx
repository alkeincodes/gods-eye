import { useEffect, useState } from "react";

export function LoadingOverlay() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 500);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500">
      <div className="text-mil-green font-mono text-2xl mb-4 tracking-widest">
        GOD&apos;S EYE
      </div>
      <div className="text-mil-text-dim font-mono text-xs mb-6">
        INITIALIZING SURVEILLANCE NETWORK
      </div>
      <div className="w-64 h-1 bg-mil-border rounded overflow-hidden">
        <div
          className="h-full bg-mil-green transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-mil-text-dim font-mono text-xs mt-2">
        {Math.min(Math.round(progress), 100)}%
      </div>
    </div>
  );
}
