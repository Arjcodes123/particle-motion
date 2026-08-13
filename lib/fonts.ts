import { Fraunces, Inter } from "next/font/google";

/**
 * Display face. Fraunces is SIL OFL: free for commercial use and self-hosted
 * by next/font, so there is no third-party request and no licence fee.
 * Chosen over the brief's "Canela-style" note, which would mean a paid
 * Commercial Type retail licence for the same visual register.
 *
 * The optical-size (`opsz`) axis is REQUIRED, not optional.
 *
 * Fraunces' opsz axis runs 9 to 144 and defaults to 14, which is a *text*
 * optical size: thick strokes, low contrast, open counters, tuned for small
 * sizes. Rendered at 80-130px it looks clumsy and blunt. The high-contrast,
 * sharp-serifed "carved" quality this brand is built on only appears near the
 * top of the axis, which is why display headings pin `opsz` to 144 in
 * globals.css.
 *
 * Dropping this axis saves about 30KB. It is not worth it: it costs the face
 * the exact characteristic it was chosen for.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

/** Body face. Inter, also SIL OFL. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
