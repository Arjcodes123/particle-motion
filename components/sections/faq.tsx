import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/lib/content";

/**
 * Answer-first FAQ, and a live demo of the AEO service being sold.
 *
 * Native <details>/<summary> rather than a JS accordion, deliberately:
 * the answer text is present in the DOM whether or not the item is open, so
 * crawlers and AI extractors always see it. A JS accordion that mounts content
 * on click would hide the very copy this section exists to get quoted.
 */
export function Faq() {
  return (
    <Section data-stage="6" tone="sunken" aria-labelledby="faq-heading">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <Eyebrow data-morph>Questions</Eyebrow>
            <h2
              id="faq-heading"
              className="mt-5 font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
            >
              Straight answers.
            </h2>
            <p className="mt-5 font-sans leading-relaxed text-ink-muted">
              Structured exactly the way we structure client content, so
              answer engines can quote it.
            </p>
          </Reveal>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold text-ink marker:content-none">
                  <h3 className="font-display text-lg font-semibold">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden
                    className="mt-1.5 shrink-0 text-accent-ink transition-transform duration-300 group-open:rotate-45"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    >
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl font-sans leading-relaxed text-ink-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
