"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  OBELISK_WORLD_HEIGHT,
  buildAllShapes,
  randomsFor,
} from "@/lib/particle-shapes";
import { initScrollStage, scrollStage } from "@/lib/scroll-stage";
import {
  obeliskFragmentShader,
  obeliskVertexShader,
} from "./obelisk-shaders";

export function ParticleSpine({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  // Shapes are rasterised from text, so the webfont must have landed first or
  // the wordmark takes the shape of the fallback serif.
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

  useEffect(() => initScrollStage(), []);

  const geometry = useMemo(() => {
    if (!fontReady) return null;

    // next/font emits an already-quoted list here, e.g.
    // `"Fraunces", "Fraunces Fallback"`. Wrapping it in further quotes yields
    // an invalid font string that canvas silently discards.
    const family = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-fraunces")
      .trim();

    const shapes = buildAllShapes(
      count,
      family ? `${family}, Georgia, serif` : "Georgia, serif",
    );

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    for (let i = 1; i < shapes.length; i += 1) {
      g.setAttribute(`aShape${i}`, new THREE.BufferAttribute(shapes[i], 3));
    }
    g.setAttribute("aRand", new THREE.BufferAttribute(randomsFor(count), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count, fontReady]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStage: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uScatter: { value: 0 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uPointerStrength: { value: 0 },
      uColorCore: { value: new THREE.Color("#FFF6DC") },
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
    const dt = Math.min(delta, 0.05); // clamp so tab-switches don't jolt

    m.uniforms.uTime.value = t;
    m.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 1.5);
    m.uniforms.uOpacity.value = THREE.MathUtils.clamp(elapsed / 1.1, 0, 1);

    // Stage is owned entirely by scroll position. The opening form is stage 0
    // and the hero occupies it, so the wordmark is what you land on rather
    // than something that plays out before you have finished reading.
    m.uniforms.uStage.value = THREE.MathUtils.damp(
      m.uniforms.uStage.value,
      scrollStage.target,
      3.5,
      dt,
    );

    // The intro is an *assembly*, not a stage change: particles begin heavily
    // displaced by the curl field and converge onto the wordmark as the
    // scatter term decays. Reusing the turbulence uniform gets the effect for
    // free, and it cannot be scrolled past before it is seen.
    const introScatter = Math.max(0, 1 - elapsed / 2.4) * 1.9;

    // Fast scrolling adds turbulence too, so flicking the page feels physical.
    const scrollScatter = THREE.MathUtils.clamp(scrollStage.velocity / 90, 0, 1);

    m.uniforms.uScatter.value = THREE.MathUtils.damp(
      m.uniforms.uScatter.value,
      Math.max(introScatter, scrollScatter),
      5,
      dt,
    );
    scrollStage.velocity *= 0.86;

    m.uniforms.uPointer.value.lerp(
      pointerTarget.current,
      1 - Math.pow(0.0015, dt),
    );
    m.uniforms.uPointerStrength.value = THREE.MathUtils.damp(
      m.uniforms.uPointerStrength.value,
      pointerActive.current,
      4,
      dt,
    );

    // Fit to the container: the canvas aspect changes with the breakpoint, so
    // a constant scale would crop.
    const fit = (viewport.height * 0.62) / OBELISK_WORLD_HEIGHT;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(t * 0.12) * 0.35;
      pointsRef.current.scale.setScalar(fit);

      // Sit in the empty right-hand column while copy occupies the left
      // (hero through pillars), then drift to centre once the form becomes an
      // ambient dust field behind the full-width conversion sections.
      const wide = size.width >= 1024;
      const parked = wide ? viewport.width * 0.22 : 0;
      const centring = THREE.MathUtils.smoothstep(
        m.uniforms.uStage.value,
        5.4,
        6.4,
      );
      pointsRef.current.position.x = THREE.MathUtils.lerp(parked, 0, centring);
    }

    // Point size tracks the fit scale, or scaling positions alone would leave
    // the sprites at a fixed pixel size and read as chunky grain.
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
