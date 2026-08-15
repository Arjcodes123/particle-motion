"use client";

import { useEffect, useRef } from "react";
import { initShapeStage, type ShapeState } from "@/lib/shape-stage";

/**
 * One label per `[data-morph]` anchor, same order they appear in the DOM
 * top to bottom. Kept here rather than read off the anchors themselves:
 * several anchors (the pillars' gold rule) carry no text at all.
 */
const STOPS = [
  "Start",
  "The shift",
  "SEO",
  "AEO",
  "GEO",
  "Services",
  "Process",
  "Pricing",
  "FAQ",
  "Let's talk",
];

/**
 * A fixed position rail on the right edge: one dot per section, a ring that
 * travels between them as you scroll, and a label naming whichever one is
 * current. This is the shared-element morph, confined on purpose.
 *
 * The earlier version let a soft glow travel freely across the whole page,
 * chasing each section's actual on-page position. Loose in open space, a
 * moving blob reads as noise, not navigation, and it kept drifting across
 * real headline text. Every dot here lives at a fixed point in the
 * viewport, so the ring only ever moves within its own lane and never
 * touches page content: it is unambiguously wayfinding UI, morphing
 * between fixed stops the way a slide deck's position indicator would,
 * not roaming set dressing.
 *
 * Also real navigation, not just decoration: each dot scrolls to its
 * section on click.
 *
 * Gated to `min-width: 1280px` (wider than the header/footer's 1024px
 * line: this adds a permanent right-edge UI element, which needs the extra
 * room), a fine pointer, and no reduced-motion. Below that it costs
 * nothing: the rail simply never mounts.
 */
export function PositionRail() {
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const columnRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mql = window.matchMedia(
      "(min-width: 1280px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!mql.matches) return;

    const ring = ringRef.current;
    const label = labelRef.current;
    const count = countRef.current;
    const rail = railRef.current;
    if (!ring || !label || !count || !rail) return;

    rail.style.visibility = "visible";

    // The ring is `position: absolute` inside the flex column (columnRef),
    // not `position: fixed` against the viewport, so its transform has to
    // be a delta from the column's own top, not a raw viewport coordinate.
    let dotOffsets: number[] = [];
    const measureDots = () => {
      const columnTop = columnRef.current?.getBoundingClientRect().top ?? 0;
      dotOffsets = dotRefs.current.map((el) => {
        const r = el?.getBoundingClientRect();
        return r ? r.top + r.height / 2 - columnTop : 0;
      });
    };
    measureDots();
    window.addEventListener("resize", measureDots);

    let lastIndex = -1;

    const apply = (state: ShapeState) => {
      const a = dotOffsets[state.index] ?? 0;
      const b = dotOffsets[state.index + 1] ?? a;
      const y = a + (b - a) * state.t;
      ring.style.transform = `translate(-50%, calc(-50% + ${y}px))`;
      ring.style.opacity = state.visible ? "1" : "0";

      const nearest = state.t < 0.5 ? state.index : Math.min(state.index + 1, STOPS.length - 1);
      if (nearest !== lastIndex) {
        lastIndex = nearest;
        label.textContent = STOPS[nearest];
        count.textContent = `${String(nearest + 1).padStart(2, "0")} / ${STOPS.length}`;
      }
    };

    const cleanup = initShapeStage(apply);
    return () => {
      cleanup();
      window.removeEventListener("resize", measureDots);
    };
  }, []);

  return (
    <nav
      ref={railRef}
      aria-label="Section position"
      style={{ visibility: "hidden" }}
      className="fixed top-1/2 right-8 z-40 hidden -translate-y-1/2 xl:flex"
    >
      <div ref={columnRef} className="relative flex flex-col items-center gap-6">
        {STOPS.map((label, i) => (
          <button
            key={label}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            type="button"
            onClick={() => {
              const anchors = document.querySelectorAll<HTMLElement>("[data-morph]");
              anchors[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            aria-label={`Jump to ${label}`}
            className="group flex h-4 w-4 items-center justify-center"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink-faint/50 transition-colors duration-300 group-hover:bg-accent-ink" />
          </button>
        ))}

        {/* The morphing ring: fixed x, animated y, crisp stroke rather than
            a diffuse glow so it reads as a UI marker, not ambient light.
            The label lives inside it and inherits its transform, so the
            two travel together without a second measurement. */}
        <div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 h-8 w-8 rounded-full border-[1.5px] border-accent-ink opacity-0 transition-opacity duration-300 ease-out-expo"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
            boxShadow: "0 0 18px -2px color-mix(in srgb, var(--color-accent) 45%, transparent)",
            willChange: "transform, opacity",
          }}
        >
          <span
            ref={labelRef}
            className="absolute top-1/2 right-full mr-4 -translate-y-1/2 whitespace-nowrap font-sans text-xs uppercase tracking-[0.14em] text-ink-faint"
          />
        </div>
      </div>

      <span
        ref={countRef}
        aria-hidden
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tabular-nums tracking-widest text-ink-faint"
      />
    </nav>
  );
}
