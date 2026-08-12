"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { HeadingTag } from "@/components/ui/heading";

/**
 * Display heading that assembles character by character in 3D.
 *
 * Each glyph starts rotated back on X and pushed away on Z, then swings
 * forward. Perspective is set on the container so characters share one
 * vanishing point and read as a single surface turning, rather than as letters
 * flipping independently.
 *
 * Two deliberate constraints, both measured rather than assumed:
 *
 * 1. GSAP is imported *dynamically*, inside the effect. Statically importing
 *    it put 134KB of ScrollTrigger and SplitText into the initial payload of
 *    every page on every device, including phones that never run the effect.
 *
 * 2. The animation is desktop-only. SplitText shatters each heading into
 *    hundreds of spans, and animating those with 3D transforms cost 3.4s of
 *    style and layout on emulated mobile. That is a large bill for a
 *    refinement nobody notices at phone size. Small screens render the
 *    heading as ordinary text and use the section's own reveal instead.
 *
 * Accessibility: GSAP's `aria: "auto"` moves the original string onto an
 * aria-label and hides the character fragments, so screen readers announce one
 * clean sentence rather than spelling it out.
 *
 * Robustness: the heading is only hidden once JS has decided to animate it, so
 * a JS failure, a crawler with scripting off, or a phone all still show fully
 * visible text.
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!desktop || !motionOk) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [gsapMod, stMod, splitMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (cancelled || !ref.current) return;

      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      const { SplitText } = splitMod;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      // Hidden from JS only, and only now that we know we will animate.
      gsap.set(el, { opacity: 0 });

      // Chars only, with no line mask. A line clip looks tidier in principle,
      // but these headings run at tight leading (0.98 to 1.05) and
      // `overflow: hidden` on a line box that short shears the ascenders and
      // descenders straight off.
      const split = new SplitText(el, { type: "chars", aria: "auto" });

      gsap.set(el, { opacity: 1, perspective: 800 });
      gsap.set(split.chars, { transformOrigin: "50% 100% -30px" });

      const tween = gsap.from(split.chars, {
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

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [delay]);

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
