import { Fraunces, Inter } from "next/font/google";

/**
 * Display face. Fraunces is SIL OFL: free for commercial use and self-hosted
 * by next/font, so there is no third-party request and no licence fee.
 * Chosen over the brief's "Canela-style" note, which would mean a paid
 * Commercial Type retail licence for the same visual register.
 *
 * The optical-size (`opsz`) axis was dropped after measurement: it sharpens
 * stroke contrast at display sizes, but every extra variable axis enlarges the
 * download, and this face is the LCP dependency for the hero headline. The
 * default optical size reads nearly identically at hero scale, so the weight
 * is not worth the paint delay.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Body face. Inter, also SIL OFL. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
