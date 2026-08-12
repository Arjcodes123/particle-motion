/**
 * Vertex shader for the scroll-driven particle spine.
 *
 * Two ideas do the heavy lifting:
 *
 * 1. A *mix chain*. Every narrative form is bound as its own attribute, and a
 *    single continuous `uStage` blends through them:
 *      p = mix(p, shapeN, clamp(uStage - (N-1), 0, 1))
 *    Each clamp saturates before the next begins, so the chain is equivalent
 *    to "blend between the two shapes either side of uStage" with no
 *    branching and no dynamic indexing (which GLSL ES forbids on attributes).
 *
 * 2. Real curl noise. The curl of a noise field is divergence-free, so
 *    particles swirl and fold like smoke instead of drifting radially. This is
 *    what separates it from the cheap sine turbulence used previously.
 */
export const obeliskVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStage;       // continuous 0..7 across the whole page
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScatter;     // extra turbulence during fast transitions
  uniform vec3  uPointer;
  uniform float uPointerStrength;

  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  attribute vec3 aShape4;
  attribute vec3 aShape5;
  attribute vec3 aShape6;
  attribute vec3 aShape7;
  attribute vec3 aRand;

  varying float vGlow;
  varying float vDepth;
  varying float vRand;

  //
  // Simplex noise (Ashima Arts / Stefan Gustavson, MIT licence).
  // Used to build the curl field below.
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  /** Curl of the noise field: divergence-free, so it swirls rather than spreads. */
  vec3 curlNoise(vec3 p) {
    const float e = 0.12;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    float x0 = snoise(p - dx); float x1 = snoise(p + dx);
    float y0 = snoise(p - dy); float y1 = snoise(p + dy);
    float z0 = snoise(p - dz); float z1 = snoise(p + dz);

    // Offset sample points give three independent fields.
    vec3 pO = p + 31.416;
    float x0b = snoise(pO - dx); float x1b = snoise(pO + dx);
    float y0b = snoise(pO - dy); float y1b = snoise(pO + dy);
    float z0b = snoise(pO - dz); float z1b = snoise(pO + dz);

    float cx = (y1b - y0b) - (z1 - z0);
    float cy = (z1b - z0b) - (x1 - x0);
    float cz = (x1b - x0b) - (y1 - y0);

    return normalize(vec3(cx, cy, cz) + 1e-5);
  }

  void main() {
    // Per-particle stagger so forms assemble progressively, not as a block.
    float lead  = (aRand.x - 0.5) * 0.34;
    float stage = clamp(uStage + lead, 0.0, 7.0);

    vec3 p = position;                                        // shape 0
    p = mix(p, aShape1, clamp(stage - 0.0, 0.0, 1.0));
    p = mix(p, aShape2, clamp(stage - 1.0, 0.0, 1.0));
    p = mix(p, aShape3, clamp(stage - 2.0, 0.0, 1.0));
    p = mix(p, aShape4, clamp(stage - 3.0, 0.0, 1.0));
    p = mix(p, aShape5, clamp(stage - 4.0, 0.0, 1.0));
    p = mix(p, aShape6, clamp(stage - 5.0, 0.0, 1.0));
    p = mix(p, aShape7, clamp(stage - 6.0, 0.0, 1.0));

    // How far through the current blend we are: 0 at a settled form, 1 at the
    // midpoint of a transition. Drives turbulence and brightness.
    float frac    = fract(stage);
    float transit = sin(frac * 3.14159265);

    // Curl advection, strongest mid-transition so forms billow apart and
    // re-gather rather than sliding along straight lines.
    vec3 flow = curlNoise(p * 0.42 + vec3(0.0, 0.0, uTime * 0.06));
    p += flow * (0.10 + transit * 0.85 + uScatter * 0.7);

    // Perpetual breathing so a settled form is never truly static.
    float phase = aRand.y * 6.2831853;
    p += vec3(
      sin(uTime * 0.45 + phase),
      cos(uTime * 0.39 + phase),
      sin(uTime * 0.33 + phase)
    ) * 0.022;

    // Page-wide cursor repulsion.
    vec3  toPointer = p - uPointer;
    float d         = length(toPointer);
    float push      = smoothstep(1.15, 0.0, d) * uPointerStrength;
    p += normalize(toPointer + 1e-4) * push * 0.42;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position     = projectionMatrix * mvPosition;

    vDepth = -mvPosition.z;
    vRand  = aRand.z;

    // Particles ignite while in flight and where the cursor disturbs them.
    // Values exceed 1.0 on purpose: the bloom pass keys off that headroom.
    vGlow = 0.55 + transit * 1.5 + push * 1.8 + uScatter * 0.8;

    float size = uSize * (0.55 + aRand.z * 0.9);
    gl_PointSize = size * uPixelRatio * (1.0 / max(vDepth, 0.15));
  }
`;

/**
 * Soft radial sprite. Output is intentionally allowed above 1.0 so the bloom
 * pass has something to bloom: the brightest particles are the ones mid-flight
 * or under the cursor.
 */
export const obeliskFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform float uOpacity;

  varying float vGlow;
  varying float vDepth;
  varying float vRand;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);

    // Cheaper than shading the square corners out.
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.0, d);
    float halo = pow(core, 3.0);

    // Hotter particles shift toward the pale gold core colour.
    vec3 color = mix(uColorEdge, uColorCore, clamp(halo * vGlow, 0.0, 1.0));

    float alpha = halo * clamp(vGlow, 0.0, 1.4);
    alpha *= smoothstep(11.0, 3.0, vDepth);
    alpha *= uOpacity;

    // A scattering of particles burns brighter, so the field glitters.
    float spark = step(0.986, vRand) * 1.8;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color * (vGlow + spark), alpha);
  }
`;
