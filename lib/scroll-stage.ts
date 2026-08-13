"use client";

/**
 * Maps scroll position to a continuous stage value for the particle spine.
 *
 * Deliberately outside React. This updates every frame, and routing it through
 * state would re-render the tree 60 times a second; the canvas simply reads
 * the mutable value inside its own render loop.
 *
 * Sections declare their own position in the narrative with `data-stage="N"`,
 * so re-ordering the page is a JSX change rather than a renderer change.
 */

export const scrollStage = {
  /** Continuous target, 0..STAGE_MAX. The canvas damps toward this. */
  target: 0,
  /** Absolute scroll delta of the last frame, used to add turbulence. */
  velocity: 0,
};

interface Band {
  stage: number;
  top: number;
  height: number;
}

let bands: Band[] = [];
let lastY = 0;
let rafPending = false;

function measure() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-stage]"),
  );

  bands = els
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        stage: Number(el.dataset.stage ?? 0),
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    })
    .sort((a, b) => a.top - b.top);
}

/**
 * A section's stage is reached when its centre passes the viewport centre;
 * between two sections the value interpolates. Anchoring on centres (rather
 * than tops) keeps the form settled while a section is being read, and puts
 * the transition in the gap between them.
 */
function computeStage(): number {
  if (bands.length === 0) return 0;

  const focus = window.scrollY + window.innerHeight / 2;
  const centreOf = (b: Band) => b.top + b.height / 2;

  if (focus <= centreOf(bands[0])) return bands[0].stage;

  for (let i = 0; i < bands.length - 1; i += 1) {
    const a = centreOf(bands[i]);
    const b = centreOf(bands[i + 1]);
    if (focus >= a && focus <= b) {
      const t = b === a ? 0 : (focus - a) / (b - a);
      return bands[i].stage + (bands[i + 1].stage - bands[i].stage) * t;
    }
  }

  return bands[bands.length - 1].stage;
}

function update() {
  rafPending = false;
  const y = window.scrollY;
  scrollStage.velocity = Math.abs(y - lastY);
  lastY = y;
  scrollStage.target = computeStage();
}

function onScroll() {
  // Coalesce to one computation per frame: scroll events can burst well above
  // frame rate, and this reads layout.
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(update);
}

/** Starts tracking. Returns a cleanup function. */
export function initScrollStage(): () => void {
  measure();
  update();

  let debounce: number | undefined;

  // Debounced. Re-measuring reads layout, and the observed element is the body
  // whose height changes while content animates, so an undebounced handler
  // turns into a measure/relayout feedback loop.
  const onResize = () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      measure();
      update();
    }, 150);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  // Sections shift as fonts load and images settle, so re-measure once things
  // have quiesced rather than trusting the first pass.
  const settle = window.setTimeout(onResize, 1200);
  const ro = new ResizeObserver(onResize);
  ro.observe(document.body);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.clearTimeout(settle);
    window.clearTimeout(debounce);
    ro.disconnect();
  };
}
