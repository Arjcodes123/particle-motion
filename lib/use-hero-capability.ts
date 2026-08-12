"use client";

import { useEffect, useState } from "react";

export type HeroCapability =
  | { mode: "poster"; reason: string }
  | { mode: "webgl"; count: number };

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * Decides whether the WebGL hero runs at all, and at what budget.
 *
 * Deliberately conservative: the client's own stated concern was low-tier
 * mobile performance, so every ambiguous signal resolves toward the poster.
 * Returns `null` until measured, so nothing is decided during SSR.
 */
export function useHeroCapability(): HeroCapability | null {
  const [capability, setCapability] = useState<HeroCapability | null>(null);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCapability({ mode: "poster", reason: "prefers-reduced-motion" });
      return;
    }

    if (nav.connection?.saveData) {
      setCapability({ mode: "poster", reason: "save-data" });
      return;
    }

    if (
      nav.connection?.effectiveType &&
      ["slow-2g", "2g"].includes(nav.connection.effectiveType)
    ) {
      setCapability({ mode: "poster", reason: "slow-network" });
      return;
    }

    // Probe for a real WebGL2 context rather than trusting UA sniffing.
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      supported = Boolean(probe.getContext("webgl2"));
    } catch {
      supported = false;
    }
    if (!supported) {
      setCapability({ mode: "poster", reason: "no-webgl2" });
      return;
    }

    // Desktop-only, deliberately.
    //
    // Measured: running this on emulated mobile cost 5.7s of total blocking
    // time (parsing ~890KB of three.js plus the glyph-sampling pass) to
    // render a decoration that sits at 35% opacity behind the headline on
    // small screens. That is a terrible trade on a site selling search
    // performance, and the client's own stated concern was low-tier mobile.
    // Phones and tablets get the poster, which is what they should have had.
    const isDesktop =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer: fine)").matches;

    if (!isDesktop) {
      setCapability({ mode: "poster", reason: "small-or-touch-viewport" });
      return;
    }

    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;

    // Even on desktop, a weak machine gets a smaller budget.
    setCapability({
      mode: "webgl",
      count: cores <= 4 || memory <= 4 ? 12000 : 40000,
    });
  }, []);

  return capability;
}

/**
 * Defers work until the browser is idle *after* load, so the hero can never
 * compete with LCP. Falls back to a timeout where requestIdleCallback is
 * unavailable (Safari).
 */
export function useDeferredMount(enabled = true): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const schedule = () => {
      if (cancelled) return;
      const ric = (
        window as unknown as {
          requestIdleCallback?: (
            cb: () => void,
            opts?: { timeout: number },
          ) => number;
        }
      ).requestIdleCallback;

      if (ric) {
        idleHandle = ric(() => !cancelled && setReady(true), { timeout: 1800 });
      } else {
        timeoutHandle = window.setTimeout(() => {
          if (!cancelled) setReady(true);
        }, 220);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
      const cic = (
        window as unknown as { cancelIdleCallback?: (h: number) => void }
      ).cancelIdleCallback;
      if (idleHandle && cic) cic(idleHandle);
    };
  }, [enabled]);

  return ready;
}
