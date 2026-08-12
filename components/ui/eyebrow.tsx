import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Small gold label above a heading. Uses --color-accent-ink (theme-flipping,
 * AA-verified) rather than the raw ornament gold, because this is text.
 */
export function Eyebrow({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-accent-ink",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="h-px w-6 bg-accent" />
      {children}
    </p>
  );
}
