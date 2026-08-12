/**
 * The particle system's vocabulary of forms.
 *
 * Every shape returns exactly `count` xyz triples, so any two can be morphed
 * index-by-index in the vertex shader. The scroll position drives which pair
 * is currently blending (see lib/scroll-stage.ts).
 *
 * Narrative order:
 *   0 wordmark    SEO / AEO / GEO
 *   1 obelisk     the brand form assembles
 *   2 shatter     it breaks apart as the thesis lands
 *   3 searchBar   "someone types a query"
 *   4 answerBlock "someone asks for an answer"
 *   5 citation    "someone asks ChatGPT"
 *   6 dust        recedes to ambience behind the conversion sections
 *   7 obelisk     re-assembles for the closing CTA
 */

export type PointSet = Float32Array;

const SHAFT_H = 2.5;
const CAP_H = 0.62;
export const OBELISK_WORLD_HEIGHT = SHAFT_H + CAP_H;

/** Deterministic PRNG so layouts are stable across renders and reloads. */
function mulberry32(seed: number) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CANVAS_W = 900;
const CANVAS_H = 560;

/**
 * Rasterise an arbitrary 2D drawing and sample its opaque pixels into a point
 * cloud.
 *
 * Generalising the original text-sampling trick to any draw callback is what
 * makes the whole narrative cheap: search bars, answer cards, and chat bubbles
 * are all just shapes drawn to a canvas, with no bespoke geometry maths and no
 * dependency on a particular typeface.
 */
export function sampleDrawing({
  draw,
  count,
  worldWidth = 4.4,
  depth = 0.16,
  seed = 1,
}: {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  count: number;
  worldWidth?: number;
  depth?: number;
  seed?: number;
}): PointSet {
  const out = new Float32Array(count * 3);
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return out;

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx, CANVAS_W, CANVAS_H);

  const { data } = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);

  // Stride the scan: the pool only needs to be a few times the particle count
  // for sampling to look uniform, and this quarters the main-thread cost.
  const STRIDE = 2;
  const pool: number[] = [];
  for (let y = 0; y < CANVAS_H; y += STRIDE) {
    for (let x = 0; x < CANVAS_W; x += STRIDE) {
      if (data[(y * CANVAS_W + x) * 4 + 3] > 128) pool.push(x, y);
    }
  }

  const rand = mulberry32(seed);
  const scale = worldWidth / CANVAS_W;
  const total = pool.length / 2;

  for (let i = 0; i < count; i += 1) {
    const p = total > 0 ? Math.floor(rand() * total) * 2 : 0;
    const px = pool[p] ?? CANVAS_W / 2;
    const py = pool[p + 1] ?? CANVAS_H / 2;

    out[i * 3] = (px - CANVAS_W / 2) * scale + (rand() - 0.5) * 0.012;
    out[i * 3 + 1] = -(py - CANVAS_H / 2) * scale + (rand() - 0.5) * 0.012;
    out[i * 3 + 2] = (rand() - 0.5) * depth;
  }

  return out;
}

/** Stage 0. The three disciplines, stacked. */
export function wordmarkShape(count: number, fontFamily: string): PointSet {
  return sampleDrawing({
    count,
    seed: 3,
    draw: (ctx, w, h) => {
      const lines = ["SEO", "AEO", "GEO"];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let size = Math.floor(h / (lines.length * 1.5));
      const setFont = (s: number) => {
        ctx.font = `600 ${s}px ${fontFamily}`;
        // Canvas silently ignores an invalid font string and keeps
        // "10px sans-serif", which would collapse the wordmark to a speck.
        if (!ctx.font.includes(`${s}px`)) ctx.font = `600 ${s}px Georgia, serif`;
      };
      setFont(size);

      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest > w * 0.7) {
        size = Math.floor(size * ((w * 0.7) / widest));
        setFont(size);
      }

      const lineH = h / (lines.length + 0.5);
      lines.forEach((line, i) => ctx.fillText(line, w / 2, lineH * (i + 0.75)));
    },
  });
}

/**
 * Stages 1 and 7. Points over the *surface* of a tapered obelisk: four shaft
 * faces plus the pyramidion. A shell rather than a solid, since interior
 * points are invisible and would be wasted budget. A share is biased onto the
 * vertical corners so the silhouette reads crisply.
 */
export function obeliskShape(count: number, seed = 7): PointSet {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);

  const baseHalf = 0.44;
  const topHalf = 0.3;
  const totalH = SHAFT_H + CAP_H;
  const yOffset = -totalH / 2;

  const halfAt = (y: number) =>
    y <= SHAFT_H
      ? baseHalf + (topHalf - baseHalf) * (y / SHAFT_H)
      : topHalf * (1 - (y - SHAFT_H) / CAP_H);

  for (let i = 0; i < count; i += 1) {
    const inCap = rand() < CAP_H / totalH / 0.75;
    const y = inCap ? SHAFT_H + rand() * CAP_H : rand() * SHAFT_H;
    const hw = halfAt(y);

    const face = Math.floor(rand() * 4);
    let u = rand() * 2 - 1;
    if (rand() < 0.22) u = Math.sign(u || 1) * (0.94 + rand() * 0.06);

    let x: number;
    let z: number;
    if (face === 0) [x, z] = [u * hw, hw];
    else if (face === 1) [x, z] = [u * hw, -hw];
    else if (face === 2) [x, z] = [hw, u * hw];
    else [x, z] = [-hw, u * hw];

    out[i * 3] = x;
    out[i * 3 + 1] = y + yOffset;
    out[i * 3 + 2] = z;
  }

  return out;
}

/**
 * Stage 2. Derived from the obelisk by pushing each point outward along its
 * own radial direction, so it reads as *that form* breaking apart rather than
 * as an unrelated cloud.
 */
export function shatterShape(count: number, seed = 11): PointSet {
  const base = obeliskShape(count, 7);
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);

  for (let i = 0; i < count; i += 1) {
    const x = base[i * 3];
    const y = base[i * 3 + 1];
    const z = base[i * 3 + 2];

    const len = Math.hypot(x, z) || 0.0001;
    const push = 0.7 + rand() * 2.6;

    out[i * 3] = (x / len) * push + (rand() - 0.5) * 0.5;
    out[i * 3 + 1] = y * (0.9 + rand() * 0.5) + (rand() - 0.5) * 0.9;
    out[i * 3 + 2] = (z / len) * push * 0.7 + (rand() - 0.5) * 0.5;
  }

  return out;
}

/** Stage 3. A search field with a magnifier: someone types a query. */
export function searchBarShape(count: number): PointSet {
  return sampleDrawing({
    count,
    seed: 5,
    depth: 0.1,
    draw: (ctx, w, h) => {
      const bw = w * 0.74;
      const bh = 128;
      const x = (w - bw) / 2;
      const y = (h - bh) / 2;

      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 64);
      ctx.stroke();

      // Magnifier
      const cx = x + 74;
      const cy = y + bh / 2;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 19, cy + 19);
      ctx.lineTo(cx + 38, cy + 38);
      ctx.stroke();

      // Typed query, suggested rather than spelled out
      ctx.beginPath();
      ctx.roundRect(x + 140, cy - 9, bw * 0.42, 18, 9);
      ctx.fill();
    },
  });
}

/** Stage 4. An answer card with one line lifted out: answer engines extract. */
export function answerBlockShape(count: number): PointSet {
  return sampleDrawing({
    count,
    seed: 6,
    depth: 0.1,
    draw: (ctx, w, h) => {
      const bw = w * 0.66;
      const bh = 300;
      const x = (w - bw) / 2;
      const y = (h - bh) / 2;

      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 26);
      ctx.stroke();

      // The extracted answer: a filled, emphasised first line
      ctx.beginPath();
      ctx.roundRect(x + 40, y + 54, bw - 80, 34, 17);
      ctx.fill();

      // Supporting lines, lighter
      const widths = [0.86, 0.94, 0.7, 0.8];
      widths.forEach((factor, i) => {
        ctx.beginPath();
        ctx.roundRect(x + 40, y + 130 + i * 38, (bw - 80) * factor, 14, 7);
        ctx.fill();
      });
    },
  });
}

/** Stage 5. A chat bubble carrying a citation marker: AI cites the source. */
export function citationShape(count: number, fontFamily: string): PointSet {
  return sampleDrawing({
    count,
    seed: 9,
    depth: 0.1,
    draw: (ctx, w, h) => {
      const bw = w * 0.52;
      const bh = 260;
      const x = (w - bw) / 2;
      const y = (h - bh) / 2 - 20;

      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 34);
      ctx.stroke();

      // Bubble tail
      ctx.beginPath();
      ctx.moveTo(x + 66, y + bh);
      ctx.lineTo(x + 52, y + bh + 46);
      ctx.lineTo(x + 116, y + bh);
      ctx.closePath();
      ctx.stroke();

      // Answer lines
      [0.8, 0.9].forEach((factor, i) => {
        ctx.beginPath();
        ctx.roundRect(x + 44, y + 62 + i * 40, (bw - 88) * factor, 14, 7);
        ctx.fill();
      });

      // The citation marker itself, the whole point of GEO
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const size = 74;
      ctx.font = `600 ${size}px ${fontFamily}`;
      if (!ctx.font.includes(`${size}px`)) {
        ctx.font = `600 ${size}px Georgia, serif`;
      }
      ctx.fillText("[1]", x + bw / 2, y + 186);
    },
  });
}

/**
 * Stage 6. A wide, sparse ambient field. Deliberately low density and pushed
 * to the edges so the conversion sections read cleanly over it.
 */
export function dustShape(count: number, seed = 21): PointSet {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);

  for (let i = 0; i < count; i += 1) {
    // Bias away from centre so copy stays legible on top.
    const edge = rand();
    const x = (rand() - 0.5) * 9 * (0.35 + edge * 0.65);
    out[i * 3] = x;
    out[i * 3 + 1] = (rand() - 0.5) * 6.5;
    out[i * 3 + 2] = (rand() - 0.5) * 3.5 - 0.6;
  }

  return out;
}

/** Per-particle randomness: [transitDelay, driftPhase, sizeJitter]. */
export function randomsFor(count: number, seed = 13): PointSet {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);
  for (let i = 0; i < count * 3; i += 1) out[i] = rand();
  return out;
}

/** Build every stage in narrative order. */
export function buildAllShapes(count: number, fontFamily: string): PointSet[] {
  return [
    wordmarkShape(count, fontFamily),
    obeliskShape(count),
    shatterShape(count),
    searchBarShape(count),
    answerBlockShape(count),
    citationShape(count, fontFamily),
    dustShape(count),
    obeliskShape(count, 7),
  ];
}

export const STAGE_COUNT = 8;
