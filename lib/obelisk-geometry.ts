/**
 * Point-cloud generation for the hero morph.
 *
 * Two matched sets of the same length: where each particle starts (sampled
 * from the glyphs SEO / AEO / GEO) and where it lands (the obelisk surface).
 * The transition between them happens entirely in the vertex shader.
 */

export type PointSet = Float32Array; // xyz triples

/** Deterministic PRNG so the layout is stable between renders and reloads. */
function mulberry32(seed: number) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rasterise the wordmark to an offscreen canvas and sample opaque pixels.
 *
 * Sampling the raster rather than extracting glyph outlines keeps this
 * font-agnostic: no typeface JSON, no font-loader, and it automatically
 * matches whatever face the design system is actually using.
 */
export function sampleTextPoints({
  lines,
  count,
  fontFamily,
  worldWidth = 4.4,
  seed = 1,
}: {
  lines: string[];
  count: number;
  fontFamily: string;
  worldWidth?: number;
  seed?: number;
}): PointSet {
  const W = 900;
  const H = 520;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const out = new Float32Array(count * 3);
  if (!ctx) return out;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let fontSize = Math.floor(H / (lines.length * 1.55));
  ctx.font = `600 ${fontSize}px ${fontFamily}`;

  // Canvas silently ignores an invalid font string and keeps "10px sans-serif",
  // which would collapse the whole wordmark into a speck. Detect that and fall
  // back to a family we know parses.
  if (!ctx.font.includes(`${fontSize}px`)) {
    ctx.font = `600 ${fontSize}px Georgia, serif`;
  }

  // Shrink to fit the widest line so long words never clip at the canvas edge.
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const maxWidth = W * 0.82;
  if (widest > maxWidth) {
    fontSize = Math.floor(fontSize * (maxWidth / widest));
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    if (!ctx.font.includes(`${fontSize}px`)) {
      ctx.font = `600 ${fontSize}px Georgia, serif`;
    }
  }

  const lineHeight = H / (lines.length + 0.6);
  lines.forEach((line, i) => {
    const y = lineHeight * (i + 0.8);
    // Letter-spaced manually: canvas letterSpacing has patchy support.
    ctx.save();
    ctx.translate(W / 2, y);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });

  const { data } = ctx.getImageData(0, 0, W, H);

  // Stride the scan rather than testing all 468k pixels. At 40k particles the
  // pool only needs to be a few times larger than the particle count for the
  // sampling to look uniform, so a 2px grid gives an identical result for a
  // quarter of the main-thread work.
  const STRIDE = 2;
  const pool: number[] = [];
  for (let y = 0; y < H; y += STRIDE) {
    for (let x = 0; x < W; x += STRIDE) {
      if (data[(y * W + x) * 4 + 3] > 128) pool.push(x, y);
    }
  }

  const rand = mulberry32(seed);
  const scale = worldWidth / W;
  const total = pool.length / 2;

  for (let i = 0; i < count; i += 1) {
    // If the glyphs yield fewer pixels than particles, reuse with jitter.
    const p = total > 0 ? Math.floor(rand() * total) * 2 : 0;
    const px = pool[p] ?? W / 2;
    const py = pool[p + 1] ?? H / 2;

    out[i * 3] = (px - W / 2) * scale + (rand() - 0.5) * 0.012;
    out[i * 3 + 1] = -(py - H / 2) * scale + (rand() - 0.5) * 0.012;
    out[i * 3 + 2] = (rand() - 0.5) * 0.18; // slight depth so it isn't a decal
  }

  return out;
}

/**
 * Points distributed over the *surface* of a tapered obelisk: four shaft
 * faces plus the pyramidion cap. A surface shell rather than a solid volume:
 * interior particles are invisible from outside and would be wasted budget.
 *
 * A share of points is biased onto the vertical corner edges so the silhouette
 * reads crisply instead of dissolving into a soft cloud.
 */
const SHAFT_H = 2.5;
const CAP_H = 0.62;

/** Total height of the generated form, in world units, used to fit-to-view. */
export const OBELISK_WORLD_HEIGHT = SHAFT_H + CAP_H;

export function generateObeliskPoints(count: number, seed = 7): PointSet {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);

  const shaftH = SHAFT_H;
  const capH = CAP_H;
  const baseHalf = 0.44;
  const topHalf = 0.3;
  const totalH = shaftH + capH;
  const yOffset = -totalH / 2;

  const halfAt = (y: number) =>
    y <= shaftH
      ? baseHalf + (topHalf - baseHalf) * (y / shaftH)
      : topHalf * (1 - (y - shaftH) / capH);

  const EDGE_SHARE = 0.22;

  for (let i = 0; i < count; i += 1) {
    const inCap = rand() < capH / totalH / 0.75;
    const y = inCap ? shaftH + rand() * capH : rand() * shaftH;
    const hw = halfAt(y);

    const face = Math.floor(rand() * 4);
    // Bias toward |u| = 1 (the corners) for part of the population.
    let u = rand() * 2 - 1;
    if (rand() < EDGE_SHARE) u = Math.sign(u || 1) * (0.94 + rand() * 0.06);

    let x: number;
    let z: number;
    if (face === 0) {
      x = u * hw;
      z = hw;
    } else if (face === 1) {
      x = u * hw;
      z = -hw;
    } else if (face === 2) {
      x = hw;
      z = u * hw;
    } else {
      x = -hw;
      z = u * hw;
    }

    out[i * 3] = x;
    out[i * 3 + 1] = y + yOffset;
    out[i * 3 + 2] = z;
  }

  return out;
}

/** Per-particle randomness: [transitDelay, driftPhase, sizeJitter]. */
export function generateRandoms(count: number, seed = 13): PointSet {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(seed);
  for (let i = 0; i < count; i += 1) {
    out[i * 3] = rand();
    out[i * 3 + 1] = rand();
    out[i * 3 + 2] = rand();
  }
  return out;
}
