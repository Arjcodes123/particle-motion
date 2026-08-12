"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import { ParticleSpine } from "./obelisk-scene";

/**
 * The persistent particle layer.
 *
 * Fixed to the viewport and mounted once for the whole page, so the system
 * survives the entire scroll rather than being a hero intro that finishes in
 * the first few seconds and is never seen again.
 *
 * Purely decorative: aria-hidden, carrying no text. Every word that matters
 * for ranking or AI citation lives in the DOM above this canvas, because
 * canvas pixels are invisible to crawlers.
 */
export function ObeliskCanvas({ count }: { count: number }) {
  // Seed from current state: a page opened in a background tab would otherwise
  // run a full render loop until a visibility event that may never arrive.
  const [paused, setPaused] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Note: no `contain: strict` on the wrapper. Its size containment makes
  // R3F's measuring pass report a zero-sized container, and the Canvas then
  // never renders its children at all.
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
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
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <ParticleSpine count={count} />

        {/*
          Bloom is what makes the gold read as *emissive* rather than as beige
          dots. The shader deliberately outputs above 1.0 for particles in
          flight and under the cursor, and this pass keys off that headroom.
        */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.35}
            luminanceThreshold={0.62}
            luminanceSmoothing={0.28}
            mipmapBlur
            radius={0.72}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
