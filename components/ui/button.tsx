import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Contrast-verified pairings (WCAG 2.1):
 *   primary   charcoal on gold-400  = 8.17  (AAA)
 *   secondary ivory   on lapis-700  = 12.37 (AAA)
 * The raw brand gold #B8860B is never used as a text ground: it fails on
 * ivory (2.83). See globals.css §2.
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ease-out-expo disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-400 text-charcoal hover:bg-gold-300 dark:bg-gold-400 dark:hover:bg-gold-300",
        secondary:
          "bg-lapis-700 text-ivory hover:bg-lapis-600 dark:bg-lapis-600 dark:hover:bg-lapis-500",
        ghost:
          "border border-border text-ink hover:border-border-strong hover:bg-bg-raised",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof button>;

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return (
    <button className={cn(button({ variant, size }), className)} {...props} />
  );
}

/** Same visual treatment, but a real anchor, for navigation not actions. */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return (
    <Link className={cn(button({ variant, size }), className)} {...props} />
  );
}
