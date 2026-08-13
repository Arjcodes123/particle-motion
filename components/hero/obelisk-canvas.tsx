"use client";

import { Canvas } from "@react-three/fiber";
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
        {/*
          No EffectComposer here, deliberately.

          A postprocessing pass renders the scene into its own buffer and
          writes the result out through a fullscreen pass, which does not
          preserve the canvas alpha channel. On a transparent canvas layered
          over the page that produced a completely invisible particle field:
          the bloom was costing us the entire visual.

          The glow is instead done in the fragment shader with additive
          blending and a soft radial falloff, which on a dark ground reads as
          emissive anyway, costs no extra render targets, and keeps the canvas
          genuinely transparent.
        */}
        <ParticleSpine count={count} />
      </Canvas>
    </div>
  );
}
