import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Surface panel. The gold top-edge highlight on hover is the restrained
 * "Minimalist Motion" register the brief specifies for interior content:
 * transform-only, so it stays off the main thread.
 */
export function Card({
  className,
  interactive = false,
  children,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-bg-raised p-6 sm:p-8",
        interactive &&
          "group transition-[border-color,transform] duration-500 ease-out-expo will-change-transform hover:-translate-y-1 hover:border-border-strong",
        className,
      )}
      {...props}
    >
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
      {children}
    </div>
  );
}
