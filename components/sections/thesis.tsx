import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

export function Thesis() {
  return (
    <Section aria-labelledby="thesis-heading">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div>
            <Eyebrow>The shift</Eyebrow>
            <SplitHeading
              as="h2"
              id="thesis-heading"
              type="words"
              className="mt-5 text-display-md"
            >
              Search stopped being one box.
            </SplitHeading>
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
