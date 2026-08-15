"use client";

/**
 * Drives the section-morph shape: a single panel that continuously reshapes
 * itself into each section's `[data-morph]` anchor as the page scrolls,
 * PowerPoint's Morph transition applied to real DOM geometry instead of
 * slide objects.
 *
 * Same measurement pattern as scroll-stage.ts: bands built from
 * getBoundingClientRect, a scroll-driven "focus" point, centre-to-centre
 * interpolation, rAF-coalesced. Extended here to interpolate a full box
 * (centre x/y, width, height) instead of a single stage number.
 *
 * Deliberately not GSAP ScrollTrigger with `pin: true`. Pinning is flagged
 * elsewhere in this codebase (components/sections/pillars.tsx) as the
 * single most common cause of a phone user losing the ability to scroll,
 * and this effect has to earn its place without ever touching the
 * scrollbar. A plain rAF loop reading layout costs nothing scroll
 * hijacking would not also cost, and it fails safe: if the loop never
 * starts, the shape simply never renders (see SectionMorph's device gate).
 *
 * Coordinates are document-absolute (top + scrollY), matching scroll-stage.
 * The consumer renders with `position: absolute` against the document root,
 * so native scrolling keeps the shape aligned with its anchors for free;
 * there is no per-frame viewport conversion to keep in sync.
 */

export interface MorphRect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

interface Band {
  centre: number;
  rect: MorphRect;
}

let bands: Band[] = [];
let rafPending = false;
let onUpdate: ((rect: MorphRect, visible: boolean) => void) | null = null;

function measure() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-morph]"),
  );

  bands = els
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + window.scrollX + r.width / 2;
      const cy = r.top + window.scrollY + r.height / 2;
      return {
        centre: cy,
        rect: { cx, cy, w: r.width, h: r.height },
      };
    })
    .sort((a, b) => a.centre - b.centre);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpRect(a: MorphRect, b: MorphRect, t: number): MorphRect {
  return {
    cx: lerp(a.cx, b.cx, t),
    cy: lerp(a.cy, b.cy, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
  };
}

/**
 * Fades out once scrolled this many px past the last anchor (the CTA
 * button), rather than lingering as a stray glow over the footer, which
 * was never designed to receive it.
 */
const TAIL_FADE_PX = 600;

function update() {
  rafPending = false;
  if (!onUpdate || bands.length === 0) return;

  const focus = window.scrollY + window.innerHeight / 2;
  const first = bands[0];
  const last = bands[bands.length - 1];

  if (focus <= first.centre) {
    onUpdate(first.rect, true);
    return;
  }

  if (focus >= last.centre) {
    const past = focus - last.centre;
    onUpdate(last.rect, past < TAIL_FADE_PX);
    return;
  }

  for (let i = 0; i < bands.length - 1; i += 1) {
    const a = bands[i];
    const b = bands[i + 1];
    if (focus >= a.centre && focus <= b.centre) {
      const t = b.centre === a.centre ? 0 : (focus - a.centre) / (b.centre - a.centre);
      onUpdate(lerpRect(a.rect, b.rect, t), true);
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
export function initShapeStage(
  cb: (rect: MorphRect, visible: boolean) => void,
): () => void {
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
