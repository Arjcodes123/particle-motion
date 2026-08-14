"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const nav = [
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

/** useLayoutEffect warns during SSR; matches the guard in motion/reveal.tsx. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The brand mark, echoing the hero obelisk. One glyph, reused at every size. */
function ObeliskGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 24" className={className} fill="currentColor">
      <path d="M6 0 9 6H3z" />
      <path d="M3 7h6l-.7 17H3.7z" opacity="0.75" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slide the active-page indicator under the current link instead of
  // snapping. Re-measures on route change and on the condense breakpoint,
  // since the pill's own width changes the link positions.
  useIsomorphicLayoutEffect(() => {
    const navEl = navRef.current;
    const indicator = indicatorRef.current;
    if (!navEl || !indicator) return;

    const active = navEl.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      indicator.style.opacity = "0";
      return;
    }
    const navBox = navEl.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    indicator.style.opacity = "1";
    indicator.style.width = `${activeBox.width}px`;
    indicator.style.transform = `translateX(${activeBox.left - navBox.left}px)`;
  }, [pathname, scrolled]);

  // Mobile menu: lock scroll, focus the first link, close on Escape. Links
  // close it themselves on click (see MobileMenu below).
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMenuLinkRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between rounded-full border border-transparent px-5 transition-[max-width,height,padding,background-color,border-color,box-shadow] duration-500 ease-out-expo sm:px-6",
          scrolled
            ? "h-14 max-w-3xl border-border bg-bg/85 shadow-lg shadow-charcoal/10 backdrop-blur-md"
            : "max-w-7xl bg-transparent",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-ink"
        >
          <span
            aria-hidden
            className={cn(
              "text-accent transition-transform duration-500 ease-out-expo",
              scrolled && "scale-90",
            )}
          >
            <ObeliskGlyph className="h-5 w-2.5" />
          </span>
          <span
            className={cn(
              "transition-[font-size] duration-500 ease-out-expo",
              scrolled ? "text-base" : "text-lg",
            )}
          >
            {site.shortName}
          </span>
        </Link>

        <nav
          ref={navRef}
          aria-label="Main"
          className="relative hidden items-center gap-8 md:flex"
        >
          <span
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute -bottom-1.5 left-0 h-px bg-accent-ink opacity-0 transition-[transform,width,opacity] duration-[400ms] ease-out-expo"
          />
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active || undefined}
                className={cn(
                  "font-sans text-sm transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <ButtonLink
            href="/contact"
            size="sm"
            className="hidden md:inline-flex"
          >
            Book a call
          </ButtonLink>
          <MenuTrigger
            ref={menuTriggerRef}
            open={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          />
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        firstLinkRef={firstMenuLinkRef}
      />
    </header>
  );
}

/**
 * Three bars morphing into an X, not two icons crossfading. React 19 takes
 * `ref` as a plain prop on function components, no forwardRef needed.
 */
function MenuTrigger({
  ref,
  open,
  onClick,
}: {
  ref: Ref<HTMLButtonElement>;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-300 hover:border-border-strong hover:text-ink md:hidden"
    >
      <span aria-hidden className="relative block h-3 w-4">
        <span
          className={cn(
            "absolute left-0 top-0 h-px w-4 bg-current transition-transform duration-300 ease-out-expo",
            open && "translate-y-[6px] rotate-45",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current transition-opacity duration-200 ease-out-expo",
            open && "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute bottom-0 left-0 h-px w-4 bg-current transition-transform duration-300 ease-out-expo",
            open && "-translate-y-[6px] -rotate-45",
          )}
        />
      </span>
    </button>
  );
}

/**
 * Expands as a circular mask from the trigger's corner rather than sliding
 * a drawer in, the same reveal-through-a-shape idea as the obys.agency
 * loader in the direction memo, done here with clip-path instead of SVG.
 * Stays in the DOM when closed (inert, zero-radius clip) so it never
 * depends on JS for crawlers, matching the Reveal component's rule that the
 * unenhanced state is always the honest one.
 */
function MobileMenu({
  open,
  onClose,
  pathname,
  firstLinkRef,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string | null;
  firstLinkRef: Ref<HTMLAnchorElement>;
}) {
  return (
    <div
      id="mobile-menu"
      inert={!open || undefined}
      style={{
        clipPath: open
          ? "circle(150% at calc(100% - 2.375rem) 2.375rem)"
          : "circle(0% at calc(100% - 2.375rem) 2.375rem)",
      }}
      className={cn(
        "fixed inset-0 z-40 bg-bg/98 backdrop-blur-sm transition-[clip-path] duration-500 ease-out-expo md:hidden",
        !open && "pointer-events-none",
      )}
    >
      <nav
        aria-label="Mobile"
        className="flex h-full flex-col items-start justify-center gap-3 px-10"
      >
        {nav.map((item, index) => {
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              ref={index === 0 ? firstLinkRef : undefined}
              href={item.href}
              onClick={onClose}
              className={cn(
                "font-display text-4xl font-semibold tracking-tight",
                active ? "text-accent-ink" : "text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <ButtonLink href="/contact" size="lg" className="mt-8" onClick={onClose}>
          Book a call
        </ButtonLink>
      </nav>
    </div>
  );
}
