/**
 * The always-present fallback beneath the WebGL layer.
 *
 * Pure CSS/SVG rather than a raster image: it is a few hundred bytes, needs no
 * network round-trip, scales to any viewport, and adapts to both themes. It is
 * the LCP candidate, so the canvas never sits on the critical path, and it is
 * the *only* visual on reduced-motion, save-data, and no-WebGL devices.
 */
export function HeroPoster() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Warm ground glow behind the column */}
      <div
        className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(184,134,11,0.28) 0%, rgba(184,134,11,0.06) 45%, transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 200 320"
        className="absolute left-1/2 top-1/2 h-[62vh] max-h-[30rem] -translate-x-1/2 -translate-y-1/2"
        fill="none"
      >
        <defs>
          <linearGradient id="obelisk-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DFBB53" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#B8860B" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="obelisk-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF0CE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Pyramidion + tapered shaft, lit face and shadowed face */}
        <path d="M100 18 L128 74 L100 74 Z" fill="url(#obelisk-face)" />
        <path
          d="M100 18 L72 74 L100 74 Z"
          fill="url(#obelisk-face)"
          opacity="0.55"
        />
        <path d="M128 74 L120 292 L100 292 L100 74 Z" fill="url(#obelisk-face)" />
        <path
          d="M72 74 L80 292 L100 292 L100 74 Z"
          fill="url(#obelisk-face)"
          opacity="0.5"
        />
        {/* Corner edge catches the light */}
        <path
          d="M100 18 L100 292"
          stroke="url(#obelisk-edge)"
          strokeWidth="1.1"
        />
      </svg>
    </div>
  );
}
