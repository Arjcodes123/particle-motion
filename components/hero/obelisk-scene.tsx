"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  OBELISK_WORLD_HEIGHT,
  generateObeliskPoints,
  generateRandoms,
  sampleTextPoints,
} from "@/lib/obelisk-geometry";
import {
  obeliskFragmentShader,
  obeliskVertexShader,
} from "./obelisk-shaders";

/** Wordmark that assembles, per strategy brief §3. */
const WORDS = ["SEO", "AEO", "GEO"];

export function ObeliskScene({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  // Sampling rasterises text, so it must wait for the webfont. Otherwise the
  // point cloud is shaped like the fallback serif.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setFontReady(true);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(done).catch(done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const geometry = useMemo(() => {
    if (!fontReady) return null;

    // next/font already emits a fully-quoted list here, e.g.
    // `"Fraunces", "Fraunces Fallback"`. Adding our own quotes around it
    // produces an invalid font string that canvas silently discards.
    const family = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-fraunces")
      .trim();

    const posA = sampleTextPoints({
      lines: WORDS,
      count,
      fontFamily: family ? `${family}, Georgia, serif` : "Georgia, serif",
    });
    const posB = generateObeliskPoints(count);
    const rand = generateRandoms(count);

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(posA, 3));
    g.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    // Points are never frustum-culled incorrectly if we bound generously.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
    return g;
  }, [count, fontReady]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uPointerStrength: { value: 0 },
      uColorCore: { value: new THREE.Color("#FBF0CE") },
      uColorEdge: { value: new THREE.Color("#B8860B") },
      uOpacity: { value: 0 },
    }),
    [],
  );

  const start = useRef<number | null>(null);
  const pointerTarget = useRef(new THREE.Vector3(99, 99, 99));
  const pointerActive = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerTarget.current.set(
        (nx * viewport.width) / 2,
        (ny * viewport.height) / 2,
        0,
      );
      pointerActive.current = 1;
    };
    const onLeave = () => {
      pointerActive.current = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [viewport.width, viewport.height]);

  useFrame((state, delta) => {
    const m = materialRef.current;
    if (!m) return;

    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t;
    const elapsed = t - start.current;

    m.uniforms.uTime.value = t;
    m.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 1.5);

    // Fade in from the scene's own first frame. Doing this with a uniform
    // rather than React state avoids signalling readiness across the R3F
    // reconciler boundary, and guarantees the particles are actually on screen
    // before anything is revealed.
    m.uniforms.uOpacity.value = THREE.MathUtils.clamp(elapsed / 0.9, 0, 1);

    // Hold the wordmark legible for a beat, then morph over ~2.2s.
    const HOLD = 1.15;
    const DURATION = 2.2;
    m.uniforms.uProgress.value = THREE.MathUtils.clamp(
      (elapsed - HOLD) / DURATION,
      0,
      1,
    );

    // Damped follow so repulsion feels weighty rather than glued to the cursor.
    m.uniforms.uPointer.value.lerp(pointerTarget.current, 1 - Math.pow(0.001, delta));
    m.uniforms.uPointerStrength.value = THREE.MathUtils.damp(
      m.uniforms.uPointerStrength.value,
      pointerActive.current,
      4,
      delta,
    );

    // Fit to the container rather than to a fixed camera framing: the canvas
    // is only part of the viewport, and its aspect changes with the
    // breakpoint, so a constant scale would crop on narrow canvases.
    const fit = (viewport.height * 0.62) / OBELISK_WORLD_HEIGHT;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(t * 0.14) * 0.32;
      pointsRef.current.scale.setScalar(fit);
    }

    // Point size has to track the fit scale too. Scaling positions alone
    // would leave the sprites at a fixed pixel size and read as chunky grain.
    m.uniforms.uSize.value = (size.width < 640 ? 18 : 27) * fit;
  });

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={obeliskVertexShader}
        fragmentShader={obeliskFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
