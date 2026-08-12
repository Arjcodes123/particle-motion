import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Tones are semi-transparent on purpose.
 *
 * The particle spine is a fixed canvas *behind* the page, so an opaque section
 * background would hide it entirely. Narrative sections use `clear` and let
 * the forms read at full strength; the conversion sections tint enough to keep
 * copy comfortable while the ambient dust still shows through.
 */
const tones = {
  clear: "",
  default: "bg-bg/85",
  raised: "bg-bg-raised/80",
  sunken: "bg-bg-sunken/85",
} as const;

const spacing = {
  sm: "py-14 sm:py-16",
  md: "py-20 sm:py-28",
  lg: "py-28 sm:py-36",
} as const;

export function Section({
  className,
  tone = "clear",
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
