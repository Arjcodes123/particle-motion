"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { useDeferredMount, useHeroCapability } from "@/lib/use-hero-capability";
import { site } from "@/lib/site";
import { HeroPoster } from "./hero-poster";

/**
 * three.js is code-split here. `ssr: false` keeps it out of the server bundle,
 * and because the import lives behind a runtime condition it never lands in
 * the shared chunk. The rest of the site downloads none of it.
 */
const ObeliskCanvas = dynamic(
  () => import("./obelisk-canvas").then((m) => m.ObeliskCanvas),
  { ssr: false },
);

export function Hero() {
  const capability = useHeroCapability();
  const canRender = capability?.mode === "webgl";
  const mounted = useDeferredMount(canRender);

  // Crossfade the static poster out once the live scene has had time to
  // compile shaders and sample the wordmark. Slightly longer than the scene's
  // own 0.9s ramp so the two overlap rather than leaving a gap.
  const [handedOver, setHandedOver] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => setHandedOver(true), 700);
    return () => window.clearTimeout(id);
  }, [mounted]);

  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-bg">
      {/* Visual column. Offset to the right on large screens so it sits
          beside the headline; behind it and dimmed on small screens, where
          there is no room for both and legibility wins. */}
      <div className="absolute inset-y-0 right-0 w-full opacity-35 sm:opacity-50 lg:w-[56%] lg:opacity-100">
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{ opacity: handedOver ? 0 : 1 }}
        >
          <HeroPoster />
        </div>

        {canRender && mounted && <ObeliskCanvas count={capability.count} />}
      </div>

      {/* Content layer. Real DOM text, above the decoration.
          This is the rule the whole hero is built around: every word that
          matters for ranking or AI citation is here, not in the canvas. */}
      <Container width="wide" className="relative z-10 py-24">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-accent-ink">
            <span aria-hidden className="h-px w-6 bg-accent" />
            SEO · AEO · GEO content
          </p>

          <h1 className="mt-6 font-display text-display-xl font-semibold leading-[0.98] tracking-[-0.03em] text-ink">
            Content <span className="text-gradient-gold">Engineered</span> to Be
            Found.
          </h1>

          <p className="mt-7 max-w-xl font-sans text-lg leading-relaxed text-ink-muted sm:text-xl">
            {site.subline} We build content that ranks on Google, gets cited by
            AI answer engines, and converts the buyers who find it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/contact" size="lg" variant="primary">
              Book a strategy call
            </ButtonLink>
            <ButtonLink href="/services" size="lg" variant="ghost">
              Explore services
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* Fades the column into the section below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg"
      />
    </section>
  );
}
