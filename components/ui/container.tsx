import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const widths = {
  narrow: "max-w-2xl", // long-form prose, ~65ch
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

export function Container({
  className,
  width = "default",
  ...props
}: ComponentProps<"div"> & { width?: keyof typeof widths }) {
  return (
    <div
      className={cn("mx-auto w-full px-6 sm:px-8", widths[width], className)}
      {...props}
    />
  );
}
