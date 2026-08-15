/**
 * The brand mark, echoing the hero obelisk. One glyph, reused at every size:
 * header (small), mobile menu, footer (huge). Shared here rather than
 * duplicated so header and footer are unmistakably the same identity, not
 * two logos that happen to look similar.
 */
export function ObeliskGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 24" className={className} fill="currentColor">
      <path d="M6 0 9 6H3z" />
      <path d="M3 7h6l-.7 17H3.7z" opacity="0.75" />
    </svg>
  );
}
