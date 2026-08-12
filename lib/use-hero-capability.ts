"use client";

import { useEffect, useState } from "react";

export type HeroCapability =
  /** Full WebGL particle spine. Desktop only. */
  | { mode: "webgl"; count: number }
  /** Lightweight 2D gold field following the same scroll stages. */
  | { mode: "lite" }
  /** Static only: reduced-motion, save-data, or no WebGL2. */
  | { mode: "poster"; reason: string };

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
    //
    // The probe context MUST be released. Browsers cap the number of live
    // WebGL contexts per page (Chrome around 16), and a probe that leaks one
    // on every load will eventually exhaust that budget, at which point this
    // check starts reporting "unsupported" on hardware that supports it
    // perfectly well and every visitor silently gets the downgraded visual.
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2");
      supported = Boolean(gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      supported = false;
    }

    // WebGL is desktop-only, deliberately.
    //
    // Measured: running the particle spine on emulated mobile cost 5.7s of
    // total blocking time, mostly parsing ~890KB of three.js. That is a
    // terrible trade on a site selling search performance, and low-tier
    // mobile was the client's own stated concern.
    //
    // Phones do NOT fall through to a static image, though: `lite` renders the
    // same narrative on a 2D canvas for a fraction of the cost.
    const isDesktop =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer: fine)").matches;

    if (!supported || !isDesktop) {
      setCapability({ mode: "lite" });
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

    const fire = () => {
      if (!cancelled) setReady(true);
    };

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

      if (ric) idleHandle = ric(fire, { timeout: 1500 });

      // Always arm a hard fallback as well. requestIdleCallback is throttled
      // (and its `timeout` not honoured) in backgrounded or unfocused tabs, so
      // relying on it alone means the visual can silently never appear —
      // which is exactly what happened during testing.
      timeoutHandle = window.setTimeout(fire, ric ? 1600 : 220);
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
