/**
 * Single source of truth for brand copy and identity.
 *
 * Copy below is lifted verbatim from the finalized strategy brief
 * (docs/Paramount_Content_Services_Creative_Strategy_v2.docx, §1).
 */

export const site = {
  name: "Paramount Content Services",
  shortName: "Paramount",
  tagline: "Content Engineered to Be Found.",
  subline: "Built for Google. Built for AI. Built for buyers.",
  mission:
    "Paramount Content Services exists to make businesses impossible to miss across Google, AI answer engines, and everywhere buyers now start their search. We fuse SEO precision, AEO structure, and GEO strategy into content that ranks, gets cited, and converts.",
  usp: "The only content partner built around all three search futures at once (SEO, AEO, and GEO), so clients show up whether someone types a query, asks a voice assistant, or asks ChatGPT.",

  /**
   * Production origin. Update at launch; used for canonical URLs, sitemap,
   * and JSON-LD @id values.
   */
  url: "https://paramountcontent.services",
  locale: "en-US",
  markets: ["US", "GB"] as const,
} as const;

/**
 * ---------------------------------------------------------------------------
 * BLOCKED: requires real client data before launch.
 *
 * Strategy brief §9 flags these as the two items that cannot be invented.
 * They are deliberately null rather than placeholder strings: a fake phone
 * number or address would ship a broken contact path and would pollute
 * LocalBusiness schema with false data.
 *
 * `hasContactDetails` gates rendering. The footer and contact blocks show an
 * honest "details pending" state rather than lorem contact info.
 * ---------------------------------------------------------------------------
 */
export const contact = {
  contactName: null,
  email: null,
  phone: null,
  address: null,
  socials: [] as { label: string; href: string }[],
} as const;

export const hasContactDetails =
  contact.email !== null && contact.phone !== null;

/** Case-study results are likewise blocked. See strategy brief §9. */
export const caseStudies: {
  clientType: string;
  challenge: string;
  approach: string;
  result: string;
}[] = [];
