"use client";

import { useEffect, useRef } from "react";
import { initShapeStage, type MorphRect } from "@/lib/shape-stage";

/** Abstract reference size the shape is authored at, then scaled from. */
const BASE = 100;

/**
 * The signature shape: one soft gold panel that continuously reshapes
 * itself into each section's `[data-morph]` anchor as you scroll, instead
 * of sections simply fading in one after another. This is the DOM-level
 * counterpart to the particle spine's own stage morphing, applied to real
 * layout geometry.
 *
 * Renders at BASE x BASE (`width`/`height` in CSS, never touched again) and
 * moves and resizes purely through `transform: translate() scale()`, so a
 * continuous scroll-driven update only ever costs the compositor: no
 * layout, no paint from box-model changes. `border-radius: 50%` is a fixed
 * value rather than an animated one, which is what turns a non-uniform
 * scale into a stadium/pill shape automatically at any target size.
 *
 * Gated to `min-width: 1024px`, a fine pointer, and no reduced-motion
 * preference: the same line the kinetic headings and the WebGL particle
 * tier already draw in this codebase. Reading layout on every scroll frame
 * is cheap for one element, but there is no reason to spend it on phones
 * where the battery budget is already committed to the particle field.
 */
export function SectionMorph() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!mql.matches) return;

    const el = ref.current;
    if (!el) return;

    // The fixed header covers roughly this many px of the viewport's top at
    // all times. A blend between two anchors that sit far apart horizontally
    // (say, the hero's eyebrow and a pillar's rule on the far side of the
    // grid) can transiently pass through that band; fading there instead of
    // clamping position avoids a visible snap.
    const HEADER_DEAD_ZONE = 90;

    const apply = (rect: MorphRect, visible: boolean) => {
      const sx = Math.max(rect.w, 1) / BASE;
      const sy = Math.max(rect.h, 1) / BASE;
      const tx = rect.cx - rect.w / 2;
      const ty = rect.cy - rect.h / 2;
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;

      const underHeader = rect.cy - window.scrollY < HEADER_DEAD_ZONE;
      el.style.opacity = visible && !underHeader ? "1" : "0";
    };

    return initShapeStage(apply);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[6] origin-top-left rounded-full opacity-0 transition-opacity duration-500 ease-out-expo"
      style={{
        width: BASE,
        height: BASE,
        background:
          "radial-gradient(circle, rgba(223,187,83,0.20) 0%, rgba(223,187,83,0.06) 55%, transparent 75%)",
        boxShadow: "0 0 60px 14px rgba(184,134,11,0.12)",
        willChange: "transform, opacity",
      }}
    />
  );
}
