"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HeadingTag } from "@/components/ui/heading";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Per-line/per-character heading reveal.
 *
 * Accessibility: SplitText shreds text into many <span>s, which would
 * otherwise be read out character-by-character. GSAP's `aria: "auto"` moves
 * the original string onto an aria-label and hides the fragments, so assistive
 * tech still reads one clean sentence.
 *
 * Reduced motion is handled with gsap.matchMedia. Under `reduce` the split
 * never happens at all, so the DOM stays untouched.
 */
export function SplitHeading({
  as = "h2",
  children,
  className,
  id,
  type = "chars",
  delay = 0,
}: {
  as?: HeadingTag;
  children: ReactNode;
  className?: string;
  /** Needed so sections can reference the heading via aria-labelledby. */
  id?: string;
  type?: "chars" | "lines" | "words";
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as as "h2";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Hidden from JS, never from CSS. useGSAP runs in a layout effect, so
      // this lands before first paint (no flash), while a JS failure or a
      // crawler with scripting off still sees fully visible text.
      gsap.set(el, { opacity: 0 });

      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOK: "(prefers-reduced-motion: no-preference)",
          motionReduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motionOK } = ctx.conditions as { motionOK: boolean };

          if (!motionOK) {
            gsap.set(el, { opacity: 1 });
            return;
          }

          const split = new SplitText(el, {
            type,
            aria: "auto",
            linesClass: "overflow-hidden",
          });

          const targets =
            type === "chars"
              ? split.chars
              : type === "words"
                ? split.words
                : split.lines;

          gsap.set(el, { opacity: 1 });
          gsap.from(targets, {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            delay,
            ease: "expo.out",
            stagger: type === "chars" ? 0.018 : 0.08,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });

          return () => split.revert();
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn(
        "font-display font-semibold leading-[1.05] tracking-[-0.025em] text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
