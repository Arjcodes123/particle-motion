"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { ObeliskScene } from "./obelisk-scene";

/**
 * WebGL host for the hero.
 *
 * Purely decorative: aria-hidden, and it carries no text. Every word that
 * matters for ranking or AI citation lives in the DOM layer above this canvas
 * (see hero.tsx). Canvas pixels are invisible to crawlers.
 *
 * The fade-in is driven by a shader uniform inside the scene rather than by
 * React state here, so nothing has to signal readiness across the R3F
 * reconciler boundary.
 */
export function ObeliskCanvas({ count }: { count: number }) {
  // Seed from the current state, not `false`: a page opened in a background
  // tab would otherwise run a full render loop until the first visibility
  // event, which may never come if the user never focuses that tab.
  const [paused, setPaused] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  // Stop rendering entirely when the tab is hidden. There is no point burning GPU
  // (and battery) on a scene nobody is looking at.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={paused ? "never" : "always"}
        gl={{
          // Additive points have no hard edges to alias, so MSAA is pure cost.
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
        }}
      >
        <ObeliskScene count={count} />
      </Canvas>
    </div>
  );
}
