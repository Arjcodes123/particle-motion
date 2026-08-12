"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDeferredMount, useHeroCapability } from "@/lib/use-hero-capability";
import { initScrollStage } from "@/lib/scroll-stage";
import { HeroPoster } from "./hero-poster";

/**
 * three.js is code-split here. `ssr: false` keeps it out of the server bundle,
 * and because the import sits behind a runtime condition it never reaches the
 * shared chunk, so the rest of the site downloads none of it.
 */
const ObeliskCanvas = dynamic(
  () => import("./obelisk-canvas").then((m) => m.ObeliskCanvas),
  { ssr: false },
);

const MobileDust = dynamic(
  () => import("./mobile-dust").then((m) => m.MobileDust),
  { ssr: false },
);

/**
 * Mounts exactly one background treatment for the whole page:
 *
 *   desktop      full WebGL particle spine, scroll-driven, with bloom
 *   mobile       lightweight 2D gold field following the same stages
 *   restricted   static poster (reduced-motion, save-data, no WebGL2)
 */
export function ParticleLayer() {
  const capability = useHeroCapability();
  const webgl = capability?.mode === "webgl";
  const lite = capability?.mode === "lite";
  const mounted = useDeferredMount(Boolean(capability));

  // The 2D field reads the same stage values as the WebGL one, so tracking has
  // to run even when three.js never loads.
  useEffect(() => {
    if (!lite) return;
    return initScrollStage();
  }, [lite]);

  if (!capability) return null;

  if (webgl) {
    return mounted ? <ObeliskCanvas count={capability.count} /> : null;
  }

  if (lite) {
    return mounted ? <MobileDust /> : null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <HeroPoster />
    </div>
  );
}
