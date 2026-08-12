import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const sizes = {
  sm: "text-sm sm:text-base",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
} as const;

/** Body copy at a comfortable measure. */
export function Prose({
  className,
  size = "md",
  ...props
}: ComponentProps<"div"> & { size?: keyof typeof sizes }) {
  return (
    <div
      className={cn(
        "font-sans leading-relaxed text-ink-muted [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-ink [&_strong]:font-semibold",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
