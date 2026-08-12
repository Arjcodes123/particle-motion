import Link from "next/link";
import { Container } from "@/components/ui/container";
import { contact, hasContactDetails, site } from "@/lib/site";

const columns = [
  {
    heading: "Services",
    links: [
      { label: "SEO Content Writing", href: "/services#seo" },
      { label: "AEO Content", href: "/services#aeo" },
      { label: "GEO Content", href: "/services#geo" },
      { label: "Technical Content", href: "/services#technical" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/resources/blog" },
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "Technical Studies", href: "/resources/technical-studies" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-sunken py-16">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div>
            <p className="font-display text-xl font-semibold text-ink">
              {site.name}
            </p>
            <p className="mt-3 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
              {site.tagline} {site.subline}
            </p>

            {/*
              Contact details are blocked pending real client data (brief §9).
              Rendering a plausible-looking placeholder address or phone number
              would mislead visitors and pollute LocalBusiness schema, so the
              gap is stated honestly instead.
            */}
            {hasContactDetails ? (
              <address className="mt-6 font-sans text-sm not-italic leading-relaxed text-ink-muted">
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
              <p className="mt-6 font-sans text-xs leading-relaxed text-ink-faint">
                Contact details pending. Awaiting verified business email,
                phone, and registered address before launch.
              </p>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-ink-faint">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-ink-faint">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-sans text-xs text-ink-faint">
            Serving the United States and United Kingdom.
          </p>
        </div>
      </Container>
    </footer>
  );
}
