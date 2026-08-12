import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/** Tags this heading may render as. Visual size stays independent of level. */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

const sizes = {
  sm: "text-display-sm",
  md: "text-display-md",
  lg: "text-display-lg",
  xl: "text-display-xl",
} as const;

/**
 * Display heading. `as` sets the semantic level independently of visual size,
 * so document outline never has to be sacrificed for layout. That matters here,
 * since heading structure is what AI answer engines parse.
 */
export function DisplayHeading({
  as = "h2",
  size = "md",
  className,
  ...props
}: ComponentProps<"h2"> & {
  as?: HeadingTag;
  size?: keyof typeof sizes;
}) {
  // All the permitted tags share the same HTML attribute surface, so this cast
  // gives TypeScript one concrete element to check against.
  const Tag = as as "h2";

  return (
    <Tag
      className={cn(
        "font-display font-semibold leading-[1.05] tracking-[-0.025em] text-ink",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
