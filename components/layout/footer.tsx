import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ObeliskGlyph } from "@/components/ui/obelisk-glyph";
import { contact, hasContactDetails, site } from "@/lib/site";

/**
 * Flattened into one row instead of three stacked columns. The three-column
 * sitemap dump is the other half of the templated shell the direction memo
 * called out; a single rule of links, in the same rhythm as a stat row,
 * reads as considered rather than defaulted.
 */
const links = [
  { label: "SEO Content Writing", href: "/services#seo" },
  { label: "AEO Content", href: "/services#aeo" },
  { label: "GEO Content", href: "/services#geo" },
  { label: "Technical Content", href: "/services#technical" },
  { label: "Blog", href: "/resources/blog" },
  { label: "Case Studies", href: "/resources/case-studies" },
  { label: "Technical Studies", href: "/resources/technical-studies" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * `relative z-10` matches #main: without an explicit stacking context, this
 * plain block would paint *behind* the fixed z-0 particle canvas (a
 * positioned element's stacking context always paints above a normal
 * in-flow sibling, regardless of DOM order), which is why particles were
 * bleeding across the old footer's text in the direction-memo screenshot.
 * That was an accident, not a choice; this makes the same effect
 * deliberate instead, by keeping the canvas visible in the gap above the
 * footer's border and fully opaque underneath it.
 *
 * A true "curtain" reveal (this section sliding up to cover the CTA as you
 * reach the bottom) was attempted with a sticky + negative-margin trick and
 * pulled back: it collapsed against this page's `flex flex-col` body,
 * rendering the footer immediately below the header instead of at the
 * bottom. Worth revisiting with a proper layout restructure, not stacked on
 * top of the existing flex shell.
 */
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-bg-sunken pt-16 pb-10">
      <Container width="wide">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 font-display text-ink"
          >
            <ObeliskGlyph className="h-14 w-8 text-accent" />
            <span className="text-display-sm font-semibold tracking-tight">
              {site.shortName}
            </span>
          </Link>

          {/*
            Contact details are blocked pending real client data (brief §9).
            Rendering a plausible-looking placeholder address or phone number
            would mislead visitors and pollute LocalBusiness schema, so the
            gap is stated honestly instead.
          */}
          {hasContactDetails ? (
            <address className="font-sans text-sm not-italic leading-relaxed text-ink-muted sm:text-right">
              {contact.email && (
                <a
                  className="block text-accent-ink underline underline-offset-4"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              )}
              {contact.phone && <span className="block">{contact.phone}</span>}
              {contact.address && (
                <span className="mt-2 block">{contact.address}</span>
              )}
            </address>
          ) : (
            <p className="max-w-xs font-sans text-xs leading-relaxed text-ink-faint sm:text-right">
              Contact details pending. Awaiting verified business email,
              phone, and registered address before launch.
            </p>
          )}
        </div>

        <nav
          aria-label="Footer"
          className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2.5 border-t border-border pt-8"
        >
          {links.map((link, index) => (
            <span key={link.href} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden className="text-ink-faint">
                  &middot;
                </span>
              )}
              <Link
                href={link.href}
                className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} {site.name}. All rights
            reserved.
          </p>
          <p className="font-sans text-xs text-ink-faint">
            Serving the United States and United Kingdom.
          </p>
        </div>
      </Container>
    </footer>
  );
}
