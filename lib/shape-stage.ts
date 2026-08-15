"use client";

/**
 * Drives the position rail (components/motion/position-rail.tsx): which of
 * the page's `[data-morph]` anchors is current, and how far the scroll has
 * progressed toward the next one.
 *
 * Same measurement pattern as scroll-stage.ts: bands built from
 * getBoundingClientRect, a scroll-driven "focus" point, centre-to-centre
 * interpolation, rAF-coalesced. This module only ever reports an index and
 * a 0..1 progress value; the rail owns turning that into a screen position,
 * since the rail's dots live at fixed points in the viewport, not at each
 * anchor's actual document position.
 *
 * Deliberately not GSAP ScrollTrigger with `pin: true`. Pinning is flagged
 * elsewhere in this codebase (components/sections/pillars.tsx) as the
 * single most common cause of a phone user losing the ability to scroll,
 * and this has to run without ever touching the scrollbar. A plain rAF
 * loop reading layout costs nothing scroll hijacking would not also cost,
 * and it fails safe: if the loop never starts, the rail simply never
 * renders (see PositionRail's device gate).
 */

export interface ShapeState {
  /** Index of the anchor at or just before the current scroll position. */
  index: number;
  /** 0..1 progress from bands[index] toward bands[index + 1]. */
  t: number;
  /** False once scrolled well past the last anchor; see TAIL_FADE_PX. */
  visible: boolean;
}

interface Band {
  centre: number;
}

let bands: Band[] = [];
let rafPending = false;
let onUpdate: ((state: ShapeState) => void) | null = null;

function measure() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-morph]"),
  );

  bands = els
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { centre: r.top + window.scrollY + r.height / 2 };
    })
    .sort((a, b) => a.centre - b.centre);
}

/**
 * Fades out once scrolled this many px past the last anchor (the CTA
 * button), rather than lingering as a stray marker with nowhere left to
 * point.
 */
const TAIL_FADE_PX = 600;

function update() {
  rafPending = false;
  if (!onUpdate || bands.length === 0) return;

  const focus = window.scrollY + window.innerHeight / 2;
  const last = bands.length - 1;

  if (focus <= bands[0].centre) {
    onUpdate({ index: 0, t: 0, visible: true });
    return;
  }

  if (focus >= bands[last].centre) {
    const past = focus - bands[last].centre;
    onUpdate({ index: last, t: 0, visible: past < TAIL_FADE_PX });
    return;
  }

  for (let i = 0; i < last; i += 1) {
    const a = bands[i];
    const b = bands[i + 1];
    if (focus >= a.centre && focus <= b.centre) {
      const t = b.centre === a.centre ? 0 : (focus - a.centre) / (b.centre - a.centre);
      onUpdate({ index: i, t, visible: true });
      return;
    }
  }
}

function onScroll() {
  // Coalesce to one computation per frame, same rationale as scroll-stage:
  // scroll events can burst well above frame rate, and this reads layout.
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(update);
}

/** Starts tracking. Returns a cleanup function. */
export function initShapeStage(cb: (state: ShapeState) => void): () => void {
  onUpdate = cb;
  measure();
  update();

  let resizeDebounce: number | undefined;
  const onResize = () => {
    window.clearTimeout(resizeDebounce);
    // Debounced for the same reason as scroll-stage: re-measuring reads
    // layout, and an undebounced handler on a resizing window becomes a
    // measure/relayout feedback loop.
    resizeDebounce = window.setTimeout(() => {
      measure();
      update();
    }, 150);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.clearTimeout(resizeDebounce);
    onUpdate = null;
    bands = [];
  };
}
