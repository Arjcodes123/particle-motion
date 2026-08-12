import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const tones = {
  default: "bg-bg",
  raised: "bg-bg-raised",
  sunken: "bg-bg-sunken",
} as const;

const spacing = {
  sm: "py-14 sm:py-16",
  md: "py-20 sm:py-28",
  lg: "py-28 sm:py-36",
} as const;

/**
 * Vertical rhythm wrapper. Sections are landmarks, so they take an
 * aria-label via `label` when they carry no visible heading.
 */
export function Section({
  className,
  tone = "default",
  size = "md",
  ...props
}: ComponentProps<"section"> & {
  tone?: keyof typeof tones;
  size?: keyof typeof spacing;
}) {
  return (
    <section
      className={cn("relative", tones[tone], spacing[size], className)}
      {...props}
    />
  );
}
