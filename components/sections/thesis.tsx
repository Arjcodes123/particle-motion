import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { KineticHeading } from "@/components/motion/kinetic-heading";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

export function Thesis() {
  return (
    <Section
      data-stage="2"
      size="lg"
      aria-labelledby="thesis-heading"
      className="min-h-[80vh] flex items-center"
    >
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div>
            <Eyebrow data-morph>The shift</Eyebrow>
            <KineticHeading
              as="h2"
              id="thesis-heading"
              className="mt-5 text-display-md leading-[1.05] tracking-[-0.025em]"
            >
              Search stopped being one box.
            </KineticHeading>
          </div>

          <Reveal delay={0.15}>
            <p className="font-sans text-lg leading-relaxed text-ink-muted">
              {site.usp}
            </p>
            <p className="mt-5 font-sans leading-relaxed text-ink-faint">
              {site.mission}
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
