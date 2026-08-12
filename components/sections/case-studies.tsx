import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { caseStudies } from "@/lib/site";

/**
 * Proof section.
 *
 * Strategy brief §9 lists real case-study results as one of two items that
 * cannot be invented. Fabricated performance claims would be misleading
 * advertising, not a creative decision. So:
 *
 *   • with real data → renders the Challenge / Approach / Result template
 *   • with no data in production → renders nothing, rather than an empty promise
 *   • with no data in development → renders a visible build note so the gap
 *     stays on the team's radar instead of silently disappearing
 */
export function CaseStudies() {
  const hasData = caseStudies.length > 0;

  if (!hasData && process.env.NODE_ENV === "production") return null;

  return (
    <Section aria-labelledby="proof-heading">
      <Container width="wide">
        <Eyebrow>Proof</Eyebrow>
        <h2
          id="proof-heading"
          className="mt-5 max-w-2xl font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
        >
          Results, in their own words.
        </h2>

        {hasData ? (
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <article
                key={cs.clientType}
                className="rounded-2xl border border-border bg-bg-raised p-8"
              >
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-accent-ink">
                  {cs.clientType}
                </p>
                <dl className="mt-6 space-y-4 font-sans text-sm leading-relaxed">
                  <div>
                    <dt className="text-ink-faint">Challenge</dt>
                    <dd className="mt-1 text-ink-muted">{cs.challenge}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Approach</dt>
                    <dd className="mt-1 text-ink-muted">{cs.approach}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Result</dt>
                    <dd className="mt-1 font-medium text-ink">{cs.result}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border-strong bg-bg-raised p-8">
            <p className="font-sans text-sm font-medium text-ink">
              Build note: not rendered in production
            </p>
            <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
              The Challenge → Approach → Result template is ready and will
              populate from <code className="font-mono text-xs">caseStudies</code>{" "}
              in <code className="font-mono text-xs">lib/site.ts</code>. Real
              client names and figures are required before launch; placeholder
              metrics are deliberately not used here.
            </p>
          </div>
        )}
      </Container>
    </Section>
  );
}
