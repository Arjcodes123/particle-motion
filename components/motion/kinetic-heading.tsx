"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { HeadingTag } from "@/components/ui/heading";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Display heading that assembles character by character in 3D.
 *
 * Each glyph starts rotated back on X and pushed away on Z, then swings
 * forward under a masked line clip. The perspective is set on the container so
 * characters share one vanishing point and read as a single surface turning,
 * rather than as letters flipping independently.
 *
 * Accessibility: SplitText shatters text into many spans, which screen readers
 * would otherwise announce one letter at a time. GSAP's `aria: "auto"` moves
 * the original string onto an aria-label and hides the fragments.
 *
 * Robustness: the heading is hidden from JS in a layout effect (pre-paint), so
 * a JS failure or a crawler with scripting off still sees fully visible text.
 */
export function KineticHeading({
  as = "h2",
  children,
  className,
  id,
  delay = 0,
  /** Optional word to render in the gold gradient. */
  gradientWord,
}: {
  as?: HeadingTag;
  children: string;
  className?: string;
  id?: string;
  delay?: number;
  gradientWord?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as as "h2";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          ok: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { ok } = ctx.conditions as { ok: boolean };
          if (!ok) return;

          gsap.set(el, { opacity: 0 });

          // Chars only, with no line masking. A line-clip mask looks tidier in
          // principle, but these headings run at tight leading (0.98–1.05) and
          // `overflow: hidden` on a line box that short shears the ascenders
          // and descenders straight off. The 3D swing plus the opacity ramp
          // already read as a reveal without needing a mask.
          const split = new SplitText(el, { type: "chars", aria: "auto" });

          gsap.set(el, { opacity: 1, perspective: 800 });
          gsap.set(split.chars, { transformOrigin: "50% 100% -30px" });

          gsap.from(split.chars, {
            yPercent: 55,
            rotateX: -72,
            z: -120,
            opacity: 0,
            duration: 1.05,
            delay,
            ease: "expo.out",
            stagger: { each: 0.022, from: "start" },
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });

          return () => split.revert();
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  // Split on the gradient word so it can carry the gold treatment while
  // remaining part of the same text node for SplitText and for crawlers.
  const content = gradientWord
    ? children.split(new RegExp(`(${gradientWord})`))
    : [children];

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn("font-display font-semibold text-ink", className)}
    >
      {content.map((part, i) =>
        part === gradientWord ? (
          <span key={i} className="text-gradient-gold">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </Tag>
  );
}
