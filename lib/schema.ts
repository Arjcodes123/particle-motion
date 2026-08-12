import { faqs, services } from "@/lib/content";
import { contact, hasContactDetails, site } from "@/lib/site";

/**
 * JSON-LD builders.
 *
 * Generated from the same `content.ts` the page renders, so the structured
 * data can never drift from the visible copy, which is both a correctness
 * property and, for search engines, a trust one.
 */

type Json = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

export function organizationSchema(): Json {
  const base: Json = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    description: site.usp,
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    knowsAbout: [
      "Search Engine Optimization",
      "Answer Engine Optimization",
      "Generative Engine Optimization",
      "Content Strategy",
      "Technical Writing",
    ],
  };

  // Contact points are omitted entirely rather than stubbed. Emitting a fake
  // telephone or address into structured data would publish false business
  // information to search engines. See strategy brief §9.
  if (hasContactDetails) {
    base.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contact.email,
      telephone: contact.phone,
    };
  }

  return base;
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/** One Service node per offering, all attributed to the organization. */
export function servicesSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} services`,
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.description,
        provider: { "@id": ORG_ID },
        serviceType: s.title,
      },
    })),
  };
}

/**
 * FAQPage: the highest-leverage schema on this site. It is what makes the
 * answer-first FAQ eligible for extraction into AI overviews and rich results.
 */
export function faqSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${site.url}${c.path}`,
    })),
  };
}
