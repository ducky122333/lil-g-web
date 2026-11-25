"use client";

import dynamic from "next/dynamic";

// WebGL only ever runs in the browser, so `next build` never evaluates three.js.
const SceneCanvas = dynamic(() => import("./three/SceneCanvas"), {
  ssr: false,
  loading: () => null,
});

export function Scene() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(139,92,246,0.16),transparent_55%),radial-gradient(ellipse_at_70%_70%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_at_25%_30%,rgba(255,179,71,0.07),transparent_45%)]" />
      <SceneCanvas />
    </div>
  );
}
