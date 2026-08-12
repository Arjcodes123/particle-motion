import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { KineticHeading } from "@/components/motion/kinetic-heading";
import { Reveal } from "@/components/motion/reveal";
import { pillars } from "@/lib/content";

/**
 * The SEO / AEO / GEO thesis: the site's core differentiator.
 *
 * Each pillar is a full-height act whose right-hand column is left
 * deliberately empty, because that is where the particle spine renders the
 * matching form (search bar, then answer card, then cited chat bubble). The
 * illustration is the particle system itself rather than a static graphic.
 *
 * The earlier version pinned this section and cross-faded stacked cards.
 * Pinning is the single most common cause of "I cannot scroll this page" on
 * phones, and the cards were doing work the particle system does far better.
 * Stage markers drive everything now, so no scroll hijacking is involved.
 */

const STAGE_FOR = { seo: 3, aeo: 4, geo: 5 } as const;

export function Pillars() {
  return (
    <>
      {pillars.map((p, i) => (
        <section
          key={p.id}
          data-stage={STAGE_FOR[p.id]}
          aria-labelledby={`pillar-${p.id}`}
          className="relative flex min-h-[88vh] items-center py-24"
        >
          <Container width="wide">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="max-w-xl">
                {i === 0 && <Eyebrow>The three search futures</Eyebrow>}

                <div className="mt-5 flex items-baseline gap-4">
                  <span className="font-display text-display-sm font-semibold text-accent-ink">
                    {p.abbr}
                  </span>
                  <span className="font-sans text-xs uppercase tracking-[0.16em] text-ink-faint">
                    {p.name}
                  </span>
                </div>

                <KineticHeading
                  as="h2"
                  id={`pillar-${p.id}`}
                  className="mt-6 text-display-md leading-[1.05] tracking-[-0.025em]"
                >
                  {p.question}
                </KineticHeading>

                <Reveal delay={0.12}>
                  <p className="mt-6 font-sans text-lg leading-relaxed text-ink-muted">
                    {p.answer}
                  </p>
                  <p className="mt-5 border-t border-border pt-5 font-sans text-sm leading-relaxed text-ink-faint">
                    {p.detail}
                  </p>
                </Reveal>
              </div>

              {/* Intentionally empty: the particle spine occupies this column
                  on large screens. Kept in the DOM so the grid reserves the
                  space and the copy never drifts under the visual. */}
              <div aria-hidden className="hidden lg:block" />
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
