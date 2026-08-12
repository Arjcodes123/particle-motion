"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { pillars } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The SEO / AEO / GEO thesis: the site's core differentiator, and the one
 * interior section the brief permits scroll storytelling on.
 *
 * The pin is wrapped in gsap.matchMedia so it only engages on pointer-fine,
 * large viewports with motion allowed. On mobile and under reduced-motion the
 * markup degrades to a plain stacked list with zero scroll hijacking. That
 * matters, because pinned sections are the single most common cause of the
 * "I can't scroll this page" complaint on phones.
 */
export function Pillars() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-pillar]");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${cards.length * 60}%`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          });

          cards.forEach((card, i) => {
            if (i === 0) {
              gsap.set(card, { opacity: 1, y: 0 });
              return;
            }
            gsap.set(card, { opacity: 0, y: 40 });
            tl.to(
              cards[i - 1],
              { opacity: 0, y: -40, duration: 0.5 },
              i - 0.5,
            ).to(card, { opacity: 1, y: 0, duration: 0.5 }, i - 0.2);
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="pillars-heading"
      className="relative overflow-hidden bg-bg-sunken py-20 sm:py-28 lg:flex lg:min-h-screen lg:items-center lg:py-0"
    >
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <div>
            <Eyebrow>The three search futures</Eyebrow>
            <h2
              id="pillars-heading"
              className="mt-5 font-display text-display-md font-semibold leading-[1.05] tracking-[-0.025em] text-ink"
            >
              Buyers stopped using one front door.
            </h2>
            <p className="mt-5 font-sans text-base leading-relaxed text-ink-muted sm:text-lg">
              Most agencies still optimize for one of these. We build for all
              three at once, because your buyer picks a different one every
              time.
            </p>
          </div>

          {/* On large screens the cards stack in place and cross-fade under
              the pin; everywhere else they simply flow down the page. */}
          <div className="relative lg:h-[26rem]">
            {pillars.map((p) => (
              <article
                key={p.id}
                data-pillar
                className="mb-6 rounded-2xl border border-border bg-bg p-8 last:mb-0 sm:p-10 lg:absolute lg:inset-0 lg:mb-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-display-sm font-semibold text-accent-ink">
                    {p.abbr}
                  </span>
                  <span className="font-sans text-xs uppercase tracking-[0.16em] text-ink-faint">
                    {p.name}
                  </span>
                </div>

                <p className="mt-6 font-display text-2xl leading-snug text-ink sm:text-3xl">
                  {p.question}
                </p>
                <p className="mt-4 font-sans leading-relaxed text-ink-muted">
                  {p.answer}
                </p>
                <p className="mt-4 border-t border-border pt-4 font-sans text-sm leading-relaxed text-ink-faint">
                  {p.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
