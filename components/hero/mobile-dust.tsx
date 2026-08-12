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

const COUNT = 900;

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
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let disperse = 0;
    const startedAt = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      const time = (now - startedAt) / 1000;

      // Stage 1 is the assembled obelisk; anything later disperses it.
      const stageTarget = Math.min(scrollStage.target, 6) / 6;
      disperse += (stageTarget - disperse) * 0.05;

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
        const alpha = Math.min((glow + spread * 0.15) * hot, 1);

        ctx.fillStyle =
          p.twinkle > 0.9
            ? `rgba(255, 244, 214, ${alpha})`
            : `rgba(184, 134, 11, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * hot, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
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
