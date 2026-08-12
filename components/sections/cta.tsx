import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

export function Cta() {
  return (
    <Section size="lg" aria-labelledby="cta-heading" className="overflow-hidden">
      {/* Gold horizon glow: the hero's ornament language, restated quietly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-50"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, rgba(184,134,11,0.22) 0%, transparent 70%)",
        }}
      />

      <Container width="wide" className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="font-display text-display-lg font-semibold leading-[1.02] tracking-[-0.03em] text-ink"
          >
            Let&rsquo;s make you impossible to miss.
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-sans text-lg leading-relaxed text-ink-muted">
            A 30-minute call. We&rsquo;ll map where you surface today across
            search, answer engines, and AI assistants, and where you should.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/contact" size="lg" variant="primary">
              Book a strategy call
            </ButtonLink>
            <ButtonLink href="/services" size="lg" variant="ghost">
              See what we do
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
