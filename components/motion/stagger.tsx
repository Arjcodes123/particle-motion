"use client";

import {
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STEP_MS = 80;

/**
 * Reveals its children in sequence when the group scrolls into view.
 *
 * The stagger is a per-child transition-delay rather than an orchestrated
 * timeline. The group is observed once, then every child transitions on its
 * own offset. Same result, no runtime scheduler.
 */
export function StaggerGroup({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(
      el.querySelectorAll<HTMLElement>("[data-stagger-item]"),
    );
    items.forEach((item, i) => {
      item.dataset.visible = "false";
      item.style.setProperty("--reveal-delay", `${i * STEP_MS}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          items.forEach((item) => {
            item.dataset.visible = "true";
          });
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [Children.count(children)]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

export function StaggerItem({
  className,
  children,
  style,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div data-reveal="" data-stagger-item="" className={cn(className)} style={style}>
      {children}
    </div>
  );
}
