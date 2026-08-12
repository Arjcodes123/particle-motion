import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { process } from "@/lib/content";

export function Process() {
  return (
    <Section data-stage="6" tone="sunken" aria-labelledby="process-heading">
      <Container width="wide">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2
            id="process-heading"
            className="mt-5 max-w-2xl font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
          >
            A method, not a content mill.
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 0.08}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-widest text-accent-ink">
                  {step.number}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
