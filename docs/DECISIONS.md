# Paramount Content Services: Build Decisions

Phase 1 (design system + Home). Source briefs are the two `.docx` files in this
folder; the v2 strategy brief is the operative one.

## Stack

Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript strict ·
Tailwind v4.1 (CSS-first `@theme`) · GSAP 3.15 (ScrollTrigger, SplitText) ·
three.js + React Three Fiber (hero only) · next-themes · Vercel target.

All dependencies verified for commercial use: MIT/Apache/OFL, except GSAP,
whose standard licence explicitly covers client and agency work. The only
prohibited use is building a competing visual animation builder.

Fonts are **Fraunces + Inter**, both SIL OFL. The brief suggested a
"Canela-style" face, but Canela is a paid Commercial Type retail font, so
Fraunces was chosen for the same high-contrast serif register at no licence
cost.

## The rule the hero is built around

**No content lives in the canvas.** The `<h1>`, every heading and all body copy
sit in real DOM above the WebGL layer, which is `aria-hidden` decoration.
Canvas pixels are invisible to crawlers and AI extractors, and this client
sells AEO/GEO, so doing otherwise would be self-defeating.

Verified: with JS disabled the prerendered HTML contains the h1, 7 h2s, 19 h3s,
all FAQ answer text, and all JSON-LD.

## Contrast

The brief's antique gold `#B8860B` measures **2.83 on ivory**, a WCAG failure
below even the 3:1 large-text floor. It is therefore an *ornament* colour only
(rules, borders, particles). Gold text uses `--color-accent-ink`, which flips
per theme: gold-300 on dark (10.23), gold-700 on light (5.66).

`--ink-faint` was also corrected after a Lighthouse audit caught it at 4.35.
Both themes now clear 4.5:1 on every surface. Accessibility score: 100.

## The particle system is the spine of the page, not an intro

The first build made the obelisk a hero decoration: one morph that completed
3.5s after load and then sat static. Anyone who read the headline first missed
it entirely and never saw it again. Everything below was fade-ups and hover
cards, which is the conventional layout the brief asked us to break.

It is now a single persistent fixed canvas spanning the whole scroll, with
eight narrative forms in `lib/particle-shapes.ts`:

| Stage | Form | Meaning |
|---|---|---|
| 0 | wordmark | SEO / AEO / GEO |
| 1 | obelisk | the brand form assembles |
| 2 | shatter | the thesis lands |
| 3 | search bar | someone types a query |
| 4 | answer card | someone asks for an answer |
| 5 | cited chat bubble | someone asks ChatGPT |
| 6 | dust | ambience behind conversion sections |
| 7 | obelisk | re-assembles for the CTA |

Sections declare their place with `data-stage`, so re-ordering the narrative is
a JSX change, not a renderer change (`lib/scroll-stage.ts`).

**Morphing is a mix chain, not dynamic indexing.** GLSL ES forbids dynamic
indexing of attributes, so every form is bound as its own attribute and a
single continuous `uStage` blends through them with saturating clamps. No
branching, no indexing.

**Closed-form, not a GPGPU simulation.** The plan called for FBO ping-pong.
The transition is choreographed rather than emergent, so integrating velocity
bought nothing, while float render targets are exactly the feature that is
flaky on mobile GPUs.

Rasterise-and-sample generalises beyond text: search bars, answer cards, and
chat bubbles are all just 2D drawings sampled into point clouds, with no
bespoke geometry maths.

## Device tiers, all measured rather than assumed

- **Desktop** (`min-width: 1024px` and `pointer: fine`): full WebGL spine,
  40k particles, real curl noise, bloom, cursor repulsion.
- **Mobile**: a 2D canvas gold field following the same scroll stages. It is
  *not* a static image. The first build's dead SVG poster made half the
  audience's experience inert.
- **Restricted** (reduced-motion, save-data, slow network): static poster.

WebGL on emulated mobile cost **5,680 ms of blocking time**, mostly parsing
~890 KB of three.js, to render something at 35% opacity behind the headline.
That is a terrible trade on a site selling search performance.

## Two bugs worth remembering

Both would have shipped silently, and both were found only by instrumenting
rather than reasoning:

1. **The WebGL2 capability probe leaked a context on every page load.**
   Browsers cap live contexts (Chrome around 16), so the probe would
   eventually report "unsupported" on perfectly capable hardware and quietly
   downgrade every visitor from then on. Always release a probe context with
   `WEBGL_lose_context`.
2. **`useDeferredMount` relied solely on `requestIdleCallback`.** It is
   throttled in unfocused tabs and may never fire, leaving the visual
   permanently absent. A hard `setTimeout` fallback is now always armed
   alongside it.

## Kinetic headings are desktop-only, and GSAP is lazy

`KineticHeading` splits text into per-character spans and swings them in 3D.
Measured on emulated mobile, that cost **3,370 ms of style and layout** across
six headings, for a refinement nobody perceives at phone size. It now runs only
at `min-width: 1024px`.

GSAP is imported **dynamically inside the effect**, not at module scope.
Statically importing it put 134 KB of ScrollTrigger and SplitText into the
initial payload of every device, including the phones that never run it.

No line-clip mask on the split: at 0.98 to 1.05 leading, `overflow: hidden` on
a line box that short shears ascenders and descenders straight off.

## Scroll reveals use IntersectionObserver, not an animation library

`Reveal` / `StaggerGroup` were originally built on Motion. Measurement showed
its runtime dominating blocking time for what is a one-shot opacity/transform
transition, so the internals were replaced with IntersectionObserver plus CSS
(`globals.css` §5). Call sites are unchanged.

Motion remains a dependency for future shared-element/`layoutId` work, but is
no longer in the initial bundle.

**Reveal state defaults to visible.** Elements are only hidden once JS sets
`data-visible="false"` in a layout effect, so a JS failure or a crawler with
scripting off still sees everything. Same principle in `SplitHeading`.

## Data that must not be invented

Strategy brief §9 lists two items that cannot be fabricated. Both are modelled
as absent rather than stubbed:

- `contact` in `lib/site.ts` is `null`. The footer renders an honest "details
  pending" note, and `organizationSchema()` omits `contactPoint` entirely
  rather than publishing a false phone or address to search engines.
- `caseStudies` is empty. The Challenge/Approach/Result template is ready but
  renders nothing in production and a visible build note in development.

## House style

No em dashes anywhere: code comments, documentation, or user-facing copy. Use
commas, colons, semicolons, parentheses, or separate sentences.

## Deviations from the brief worth raising with the client

1. **No self-serve checkout.** Nobody buys a $5,500/mo retainer from a Buy
   button, and the brief itself flagged six competing CTAs as a risk. Every
   tier routes to a call. Reserve Stripe for productized one-offs.
2. **Do not use HubSpot's embed script** when integrations land. Use native
   forms into a route handler into the HubSpot API, or it will undo the
   performance work.

## Current measurements (Lighthouse mobile, simulated throttling, local)

| | |
|---|---|
| Performance | 73 |
| Accessibility | **100** |
| Best practices | 96 |
| SEO | **100** |
| CLS | **0** |
| TBT | 1,320 ms |
| LCP | 2.5 s |

### How much the spectacle actually costs

Measured by comparing `/` against `/styleguide`, which renders the same design
system and CSS but mounts no particle layer:

| | `/` (canvas) | `/styleguide` (none) |
|---|---|---|
| Performance | 74 | 74 |
| TBT | 970 ms | 700 ms |
| Script evaluation | 2,187 ms | 1,031 ms |

**A page with no particle system at all scores the same.** The remaining gap to
90 is baseline React and Next hydration under a 4x CPU throttle, not the
visual. The entire spine costs roughly 270 ms of blocking time.

Getting here took three specific fixes, each worth recording because the naive
version of each is the obvious thing to write:

1. **Kinetic headings gated to desktop, GSAP imported dynamically.** Splitting
   six headings into per-character spans cost 3,370 ms of style and layout on
   mobile; the static import put 134 KB in every device's initial payload.
2. **Mobile dust uses a cached sprite blitted with `drawImage`,** not
   `arc()` + `fill()` per particle, at 220 particles, 24fps, and DPR 1. Path
   fills per particle per frame were the dominant cost, and the glow is soft
   enough that rendering above 1x is invisible.
3. **Tinted sections are opaque below `lg`.** A translucent panel stacked over
   a continuously repainting fixed canvas forces the compositor to redraw that
   whole region every frame.

Together: mobile 56 -> 73, TBT 4,900 ms -> 1,320 ms.

Note these come from `next start` on localhost with no CDN and no brotli.
Vercel's edge should improve them.

## Next up

- `/styleguide` is built and unindexed. Get creative direction signed off there
  before building interior pages.
- Sanity wiring (phase 2), alongside Services / About / Resources / Contact.
- Content types in `lib/content.ts` are shaped to become Sanity documents.
