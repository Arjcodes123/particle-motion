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
      const [gsapMod, splitMod] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      if (cancelled || !ref.current) return;

      const gsap = gsapMod.default;
      const { SplitText } = splitMod;
      gsap.registerPlugin(SplitText);

      // Hidden from JS only, and only now that we know we will animate.
      gsap.set(el, { opacity: 0 });

      // Chars only, with no line mask. A line clip looks tidier in principle,
      // but these headings run at tight leading (0.98 to 1.05) and
      // `overflow: hidden` on a line box that short shears the ascenders and
      // descenders straight off.
      const split = new SplitText(el, { type: "chars", aria: "auto" });

      gsap.set(el, { opacity: 1 });

      // Explicit set-then-to, never gsap.from(), and IntersectionObserver
      // rather than ScrollTrigger.
      //
      // A `from` tween driven by ScrollTrigger re-applies its start state on
      // every ScrollTrigger.refresh(). Refresh fires on resize, and the page
      // height shifts constantly while sections animate, so the headline was
      // being reset mid-reveal over and over and never settled.
      //
      // Perspective is also per character, not on the container: with a shared
      // vanishing point, rotating a glyph drags it sideways toward the centre,
      // which scatters a wide headline across the page.
      gsap.set(split.chars, {
        yPercent: 40,
        rotateX: -55,
        transformPerspective: 420,
        transformOrigin: "50% 100%",
        opacity: 0,
      });

      let tween: gsap.core.Tween | undefined;
      const reveal = () => {
        tween = gsap.to(split.chars, {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: "expo.out",
          stagger: { each: 0.02, from: "start" },
        });
      };

      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          io.disconnect();
          reveal();
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
      );
      io.observe(el);

      cleanup = () => {
        io.disconnect();
        tween?.kill();
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
      {/*
        Solid gold, NOT the text-gradient-gold utility.

        That utility works by painting a gradient on the element and clipping
        it to the glyphs, which requires the background and the text to live on
        the same box. SplitText moves every character into its own div, so the
        characters inherit `color: transparent` while the background stays
        behind on the emptied wrapper: the word renders completely invisible.
        A solid accent colour survives being split apart.
      */}
      {content.map((part, i) =>
        part === gradientWord ? (
          <span key={i} className="text-accent-ink">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </Tag>
  );
}
