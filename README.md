# Particle Motion

A snapshot of the Paramount Content Services marketing site, built around a scroll driven WebGL particle system. This version is preserved as a reference: the live project later replaced the particle spine with a different scroll interaction, and this repository keeps the particle era intact on its own.

## What this is

The homepage centers on a single persistent particle canvas that runs behind the whole page. As you scroll, the particles interpolate through a sequence of narrative forms: a wordmark, an obelisk, a search bar, an answer card, a cited chat bubble, ambient dust, then the obelisk again for the closing call to action. Every heading and all body copy live in real DOM above the canvas, never inside it, so the particle layer is purely decorative and every crawler still sees full content.

Device tiers are measured, not assumed:

- Desktop (fine pointer, wide viewport): full WebGL particle spine with real curl noise and cursor interaction.
- Mobile: a lightweight 2D canvas following the same scroll stages, not a static fallback image.
- Reduced motion, save data, or no WebGL2 support: a static poster, no canvas at all.

The header, footer, and section layouts in this snapshot also include an earlier navigation experiment: a right edge dot rail with a small ring that morphs between section anchors as you scroll.

## Stack

- Next.js (App Router, Turbopack)
- React, TypeScript (strict)
- Tailwind CSS v4 (CSS first theme)
- GSAP (ScrollTrigger, SplitText)
- three.js and React Three Fiber for the particle canvas
- next-themes for light and dark mode

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- `lib/site.ts` intentionally leaves contact details and case study data unset rather than filled with placeholders; both are gated behind real client data before launch.
- Colour tokens are contrast checked against WCAG 2.1: the brand gold is used as an ornament colour only, never as text on its own, since it fails contrast on both light and dark grounds at that weight.
- Kinetic per character headline animation is desktop only; it costs too much layout time on phones for a refinement most visitors never consciously notice.
