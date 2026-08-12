/**
 * Vertex shader for the wordmark → obelisk morph.
 *
 * Deliberately *not* a GPGPU particle simulation. The transition is
 * choreographed, not emergent, so integrating velocity buys nothing visually
 * while costing ping-pong render targets and a dependency on float-texture
 * support, which is exactly the feature that is patchy on mobile GPUs. All
 * the motion below is a closed-form function of (start, end, progress, time),
 * so it is deterministic, cheap, and works on any WebGL2 device.
 */
export const obeliskVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;   // 0 = wordmark, 1 = obelisk
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3  uPointer;    // world-space cursor
  uniform float uPointerStrength;

  attribute vec3 aPosB;
  attribute vec3 aRand;

  varying float vGlow;
  varying float vDepth;

  // Cheap sine turbulence. Full curl noise is ~60 lines of GLSL for a
  // difference nobody perceives during a 1.6s transit.
  vec3 turbulence(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t * 0.70),
      sin(p.z * 1.9 + t * 0.62),
      sin(p.x * 1.5 + t * 0.83)
    );
  }

  float easeInOutCubic(float x) {
    return x < 0.5
      ? 4.0 * x * x * x
      : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Staggered departure: particles do not all leave at once.
    float delay  = aRand.x * 0.38;
    float t      = clamp((uProgress - delay) / (1.0 - 0.38), 0.0, 1.0);
    float e      = easeInOutCubic(t);

    vec3 pos = mix(position, aPosB, e);

    // Swell outward at mid-flight, zero at both ends, so the cloud blooms
    // through the transition instead of sliding along straight lines.
    float arc = sin(e * 3.14159265);
    pos += turbulence(position * 1.6 + aRand.yzx * 4.0, uTime * 0.6)
           * arc * 0.42;

    // Perpetual slow drift so the settled obelisk still breathes.
    float phase = aRand.y * 6.2831853;
    pos += vec3(
      sin(uTime * 0.42 + phase),
      cos(uTime * 0.37 + phase),
      sin(uTime * 0.31 + phase)
    ) * 0.016;

    // Cursor repulsion, falling off smoothly within a fixed radius.
    vec3  toPointer = pos - uPointer;
    float d         = length(toPointer);
    float push      = smoothstep(0.85, 0.0, d) * uPointerStrength;
    pos += normalize(toPointer + 1e-4) * push * 0.32;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position     = projectionMatrix * mvPosition;

    // Brighter mid-flight and on edge particles, which sells the "ignition".
    vGlow  = 0.55 + arc * 0.45 + push * 0.6;
    vDepth = -mvPosition.z;

    float size = uSize * (0.65 + aRand.z * 0.7);
    gl_PointSize = size * uPixelRatio * (1.0 / max(vDepth, 0.15));
  }
`;

/**
 * Soft radial falloff + additive blending. This fakes bloom well enough on a
 * dark ground that a full EffectComposer pass (extra render targets, ~50KB of
 * postprocessing) is not worth its cost against the performance budget.
 */
export const obeliskFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform float uOpacity;   // scene-level fade-in, ramped on the CPU

  varying float vGlow;
  varying float vDepth;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);

    // Discard the square corners early, cheaper than shading them out.
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.0, d);
    float halo = pow(core, 3.0);

    vec3  color = mix(uColorEdge, uColorCore, halo);
    float alpha = halo * vGlow;

    // Fade the far side of the column so the form reads three-dimensional.
    alpha *= smoothstep(9.0, 3.2, vDepth);
    alpha *= uOpacity;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color * vGlow, alpha);
  }
`;
