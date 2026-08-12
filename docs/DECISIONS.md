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

## Hero: choreographed morph, not a particle simulation

The plan called for a GPGPU FBO ping-pong simulation. It was built instead as a
closed-form vertex-shader morph, `mix(textPosition, obeliskPosition, eased)`
with turbulence and cursor repulsion layered on. The transition is
art-directed, not emergent, so velocity integration bought nothing, while float
render targets are exactly the feature that is flaky on mobile GPUs.

## Hero is desktop-only, measured rather than assumed

Running the WebGL hero on emulated mobile cost **5,680 ms of total blocking
time** (parsing ~890 KB of three.js plus glyph sampling) to render a decoration
sitting at 35% opacity behind the headline. It now requires
`(min-width: 1024px) and (pointer: fine)`; everything else gets the CSS/SVG
poster. TBT after this change: 300 ms.

Also gated to poster: `prefers-reduced-motion`, save-data, slow networks, and
absent WebGL2.

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
| Performance | 81 |
| Accessibility | **100** |
| Best practices | 96 |
| SEO | **100** |
| CLS | 0 |
| TBT | 300 ms |
| LCP | 3.6 s (the remaining gap) |

LCP is dominated by the display-font swap on the `<h1>`. Dropping Fraunces'
`opsz` axis cut that file from 67 KB to 37 KB. Further options, in order of
appeal: self-host a subset limited to the characters actually used at hero
size; or switch the display face to `display: optional`, rejected so far
because it would often show the fallback serif on a brand-led page.

Note these numbers come from `next start` on localhost with no CDN and no
brotli. Vercel's edge should improve them.

## Next up

- `/styleguide` is built and unindexed. Get creative direction signed off there
  before building interior pages.
- Sanity wiring (phase 2), alongside Services / About / Resources / Contact.
- Content types in `lib/content.ts` are shaped to become Sanity documents.
