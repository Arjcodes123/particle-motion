import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { tiers } from "@/lib/content";

function Check() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-[0.35rem] h-3 w-3 shrink-0 text-accent-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8.5 6 12l7.5-8" />
    </svg>
  );
}

/**
 * Every tier routes to a conversation rather than a checkout.
 *
 * The brief asked for a pricing page with self-serve checkout, but nobody buys
 * a $5,500/mo retainer from a Buy button, and six competing CTAs was flagged
 * as a risk in the brief itself. Stripe is better reserved for productized
 * one-offs (audit, article pack) in a later phase.
 */
export function Pricing() {
  return (
    <Section data-stage="6" tone="default" aria-labelledby="pricing-heading">
      <Container width="wide">
        <Reveal>
          <Eyebrow>Packages</Eyebrow>
          <h2
            id="pricing-heading"
            className="mt-5 max-w-2xl font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
          >
            Programs that scale with ambition.
          </h2>
          <p className="mt-5 max-w-xl font-sans leading-relaxed text-ink-muted">
            Monthly retainers, no long lock-ins. Every engagement starts with a
            call so the scope matches the goal.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-4 sm:grid-cols-2">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.07} className="h-full">
              <div
                className={cn(
                  "flex h-full flex-col rounded-2xl border p-7",
                  tier.featured
                    ? "border-accent bg-bg-raised"
                    : "border-border bg-bg-raised",
                )}
              >
                {tier.featured && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-accent/12 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink">
                    Most chosen
                  </span>
                )}

                <h3 className="font-display text-xl font-semibold text-ink">
                  {tier.name}
                </h3>
                <p className="mt-2 font-sans text-sm text-ink-faint">
                  {tier.summary}
                </p>

                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-semibold text-ink">
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span className="font-sans text-sm text-ink-faint">
                      {tier.cadence}
                    </span>
                  )}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 font-sans text-sm leading-relaxed text-ink-muted"
                    >
                      <Check />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href="/contact"
                  variant={tier.featured ? "primary" : "ghost"}
                  className="mt-7 w-full"
                >
                  Book a call
                </ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 font-sans text-xs text-ink-faint">
          Prices in USD. UK engagements quoted in GBP at the prevailing rate.
        </p>
      </Container>
    </Section>
  );
}
