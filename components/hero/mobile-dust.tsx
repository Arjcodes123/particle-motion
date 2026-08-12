"use client";

import { useEffect, useRef } from "react";
import { scrollStage } from "@/lib/scroll-stage";

/**
 * The mobile counterpart to the WebGL spine.
 *
 * Same idea at a fraction of the cost: a small 2D-canvas gold field that
 * follows the same scroll stages, morphing between an obelisk silhouette and a
 * drifting cloud. No three.js, no shaders, ~900 particles.
 *
 * This exists because the previous mobile fallback was a static SVG, which
 * made half the audience's experience completely inert. Phones get less, but
 * they should not get nothing.
 */

/**
 * Deliberately modest. Each particle costs a draw call per frame, and mobile
 * is exactly where that budget is tightest.
 */
const COUNT = 220;

/** Redraw cap. 60fps buys nothing for slow-drifting dust and costs plenty. */
const FRAME_MS = 1000 / 24;

/**
 * Pre-render the glow once into a small offscreen canvas.
 *
 * Per-particle `arc()` + `fill()` was measured as the dominant cost here:
 * hundreds of path fills per frame on a throttled CPU. Blitting a cached
 * sprite with drawImage is dramatically cheaper for an identical result.
 */
function makeSprite(rgb: string): HTMLCanvasElement {
  const size = 24;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.4, `rgba(${rgb},0.45)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

interface P {
  ox: number; // obelisk-form position, normalised 0..1
  oy: number;
  cx: number; // cloud-form position
  cy: number;
  r: number;
  phase: number;
  twinkle: number;
}

function build(): P[] {
  // Deterministic layout so it looks identical on every load.
  let seed = 99;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const pts: P[] = [];
  for (let i = 0; i < COUNT; i += 1) {
    // Obelisk silhouette: tapered shaft plus a pyramidion cap.
    const t = rand();
    let ox: number;
    let oy: number;
    if (t < 0.22) {
      const k = rand();
      oy = 0.12 + k * 0.16;
      const halfW = 0.085 * (k);
      ox = 0.5 + (rand() * 2 - 1) * halfW;
    } else {
      const k = rand();
      oy = 0.28 + k * 0.6;
      const halfW = 0.085 - 0.02 * (1 - k);
      ox = 0.5 + (rand() * 2 - 1) * halfW;
      // Bias to the edges so the silhouette has defined sides.
      if (rand() < 0.45) ox = 0.5 + Math.sign(ox - 0.5) * halfW;
    }

    pts.push({
      ox,
      oy,
      cx: rand(),
      cy: rand(),
      r: 0.5 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
      twinkle: rand(),
    });
  }
  return pts;
}

export function MobileDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const pts = build();
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      // Deliberately 1, not devicePixelRatio. This is a soft, out-of-focus
      // glow with no edges to sharpen, so rendering at 2x or 3x quadruples or
      // nonuples the fill cost for a difference nobody can see.
      dpr = 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const goldSprite = makeSprite("184,134,11");
    const paleSprite = makeSprite("255,244,214");

    let disperse = 0;
    let lastDraw = 0;
    const startedAt = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;

      const time = (now - startedAt) / 1000;

      // Stage 1 is the assembled obelisk; anything later disperses it.
      const stageTarget = Math.min(scrollStage.target, 6) / 6;
      disperse += (stageTarget - disperse) * 0.08;

      // A brief intro so the form assembles rather than appearing complete.
      const intro = Math.min(time / 2.2, 1);
      const spread = Math.max(disperse, 1 - intro);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < COUNT; i += 1) {
        const p = pts[i];
        const drift = Math.sin(time * 0.6 + p.phase) * 0.006;

        const x = (p.ox + (p.cx - p.ox) * spread + drift) * w;
        const y = (p.oy + (p.cy - p.oy) * spread) * h;

        const glow = 0.35 + Math.sin(time * 1.6 + p.phase) * 0.18;
        const hot = p.twinkle > 0.97 ? 1.7 : 1;

        ctx.globalAlpha = Math.min((glow + spread * 0.15) * hot, 1);
        const sprite = p.twinkle > 0.9 ? paleSprite : goldSprite;
        const d = p.r * hot * 5;
        ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
    />
  );
}
