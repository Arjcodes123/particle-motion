import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { KineticHeading } from "@/components/motion/kinetic-heading";
import { site } from "@/lib/site";

/**
 * Hero copy. The visual now lives in the page-level <ParticleLayer />, which
 * persists across the whole scroll instead of playing once and stopping.
 *
 * This component is a server component: no hooks, no client JS, and the
 * headline ships in the initial HTML.
 */
export function Hero() {
  return (
    <section
      data-stage="0"
      className="relative isolate flex min-h-[92vh] items-center"
    >
      <Container width="wide" className="relative z-10 py-28">
        <div className="max-w-2xl">
          <p
            data-morph
            className="flex w-fit items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-accent-ink"
          >
            <span aria-hidden className="h-px w-6 bg-accent" />
            SEO · AEO · GEO content
          </p>

          <KineticHeading
            as="h1"
            className="mt-6 text-display-xl leading-[0.98] tracking-[-0.03em]"
            gradientWord="Engineered"
          >
            Content Engineered to Be Found.
          </KineticHeading>

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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg"
      />
    </section>
  );
}
