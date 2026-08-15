import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Reveal } from "@/components/motion/reveal";
import { services } from "@/lib/content";

export function Services() {
  return (
    <Section data-stage="6" tone="default" aria-labelledby="services-heading">
      <Container width="wide">
        <Reveal>
          <Eyebrow data-morph>What we write</Eyebrow>
          <h2
            id="services-heading"
            className="mt-5 max-w-2xl font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
          >
            Six disciplines, one standard.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <Card interactive className="h-full">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                  {s.description}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
