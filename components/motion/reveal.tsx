"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { HeadingTag } from "@/components/ui/heading";

type RevealTag = HeadingTag | "li" | "section" | "article";

/** useLayoutEffect warns during SSR; this component is client-only in practice. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const OFFSETS: Record<string, { x?: string; y?: string }> = {
  up: { y: "1.5rem" },
  left: { x: "-1.5rem", y: "0" },
  right: { x: "1.5rem", y: "0" },
  none: { y: "0" },
};

/**
 * Scroll-triggered entrance.
 *
 * Implemented with IntersectionObserver plus a CSS transition rather than an
 * animation library: this is a one-shot opacity/transform tween, and measuring
 * showed the library runtime dominating total blocking time on mobile for no
 * behavioural gain. Animation stays on the compositor either way.
 *
 * Reduced motion is handled in CSS (see globals.css §5), so it applies even if
 * a call site forgets. Accessibility is structural, not opt-in.
 */
export function Reveal({
  as = "div",
  delay = 0,
  direction = "up",
  className,
  children,
  style,
}: {
  as?: RevealTag;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hide before first paint, so there is no flash of the final state.
    el.dataset.visible = "false";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offset = OFFSETS[direction] ?? OFFSETS.up;

  return createElement(
    as,
    {
      ref,
      "data-reveal": "",
      className: cn(className),
      style: {
        ...style,
        "--reveal-delay": `${Math.round(delay * 1000)}ms`,
        ...(offset.x ? { "--reveal-x": offset.x } : {}),
        ...(offset.y !== undefined ? { "--reveal-y": offset.y } : {}),
      } as CSSProperties,
    },
    children,
  );
}
