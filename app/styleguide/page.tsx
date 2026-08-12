import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const lapis = [
  "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950",
];
const gold = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

/** Verified with WCAG 2.1 relative-luminance maths. See plan verification step. */
const contrast = [
  { pair: "ink on bg", dark: "16.44", light: "15.27", grade: "AAA" },
  { pair: "ink-muted on bg", dark: "7.53", light: "6.55", grade: "AA+" },
  { pair: "accent-ink on bg", dark: "10.23", light: "5.66", grade: "AA+" },
  { pair: "primary button", dark: "8.17", light: "8.17", grade: "AAA" },
  { pair: "secondary button", dark: "8.43", light: "12.37", grade: "AAA" },
];

function Swatches({ name, steps }: { name: string; steps: string[] }) {
  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-widest text-ink-faint">
        {name}
      </p>
      <div className="flex flex-wrap gap-1">
        {steps.map((s) => (
          <div key={s} className="w-16">
            <div
              className="h-12 rounded-md border border-border"
              style={{ backgroundColor: `var(--color-${name}-${s})` }}
            />
            <p className="mt-1 text-center font-mono text-[10px] text-ink-faint">
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The full primitive set, rendered once per theme. */
function Specimen() {
  return (
    <div className="space-y-10 bg-bg p-8 text-ink">
      <div className="space-y-3">
        <Eyebrow>Answer Engine Optimization</Eyebrow>
        <DisplayHeading as="p" size="md">
          {site.tagline}
        </DisplayHeading>
        <Prose>
          Built for Google. Built for AI. Built for buyers. Body copy sits at a
          comfortable measure with <strong>emphasis</strong> and{" "}
          <a href="#">an inline link</a> for reference.
        </Prose>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Book a call</Button>
        <Button variant="secondary">See pricing</Button>
        <Button variant="ghost">Read the guide</Button>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card interactive>
          <h3 className="font-display text-lg text-ink">Interactive card</h3>
          <Prose size="sm" className="mt-2">
            Hover for the gold edge and lift: the restrained interior register.
          </Prose>
        </Card>
        <Card>
          <h3 className="font-display text-lg text-ink">Static card</h3>
          <Prose size="sm" className="mt-2">
            Same surface, no motion. Used inside dense content.
          </Prose>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {["bg", "bg-raised", "bg-sunken", "border", "accent"].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <span
              className="inline-block h-6 w-6 rounded border border-border"
              style={{ backgroundColor: `var(--color-${t})` }}
            />
            <code className="font-mono text-xs text-ink-muted">{t}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="flex-1">
      <Section size="sm">
        <Container width="wide" className="space-y-4">
          <Eyebrow>Internal</Eyebrow>
          <DisplayHeading as="h1" size="lg">
            Design system
          </DisplayHeading>
          <Prose className="max-w-2xl">
            Every token, type step and primitive for {site.name}. Not indexed,
            not linked from the site. It exists so creative direction
            can be signed off before page-building starts.
          </Prose>
        </Container>
      </Section>

      <Section tone="sunken" size="sm">
        <Container width="wide" className="space-y-8">
          <DisplayHeading size="sm">Brand ramps</DisplayHeading>
          <Swatches name="lapis" steps={lapis} />
          <Swatches name="gold" steps={gold} />
          <Prose size="sm" className="max-w-2xl">
            <strong>gold-500 (#B8860B)</strong> is the brief&rsquo;s accent. It
            scores <strong>2.83 on ivory</strong>, a WCAG failure below even
            the 3:1 large-text floor, so it is reserved for ornament: rules,
            borders, particles. Gold <em>text</em> uses{" "}
            <code className="font-mono text-xs">--color-accent-ink</code>, which
            flips to gold-300 on dark and gold-700 on light.
          </Prose>
        </Container>
      </Section>

      <Section size="sm">
        <Container width="wide" className="space-y-6">
          <DisplayHeading size="sm">Contrast audit</DisplayHeading>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-border text-ink-faint">
                  <th className="py-2 pr-4 font-medium">Pair</th>
                  <th className="py-2 pr-4 font-medium">Dark</th>
                  <th className="py-2 pr-4 font-medium">Light</th>
                  <th className="py-2 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {contrast.map((r) => (
                  <tr key={r.pair} className="border-b border-border">
                    <td className="py-2 pr-4 text-ink-muted">{r.pair}</td>
                    <td className="py-2 pr-4 font-mono text-ink">{r.dark}</td>
                    <td className="py-2 pr-4 font-mono text-ink">{r.light}</td>
                    <td className="py-2 text-accent-ink">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section tone="sunken" size="sm">
        <Container width="wide" className="space-y-6">
          <DisplayHeading size="sm">Type scale</DisplayHeading>
          <div className="space-y-4">
            {(["xl", "lg", "md", "sm"] as const).map((s) => (
              <div key={s} className="border-b border-border pb-4">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  display-{s}
                </p>
                <DisplayHeading as="p" size={s}>
                  Engineered to be found
                </DisplayHeading>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Both themes at once. The dark variant keys off a class, so nesting a
          .dark wrapper renders a true dark specimen inside a light page. */}
      <Section size="sm">
        <Container width="wide" className="space-y-6">
          <DisplayHeading size="sm">Primitives, both themes</DisplayHeading>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border">
              <p className="border-b border-border bg-bg-sunken px-4 py-2 font-mono text-xs text-ink-faint">
                light
              </p>
              <div className="light">
                <Specimen />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <p className="border-b border-border bg-bg-sunken px-4 py-2 font-mono text-xs text-ink-faint">
                dark
              </p>
              <div className="dark">
                <Specimen />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
