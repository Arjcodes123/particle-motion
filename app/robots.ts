import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * AI crawlers are explicitly welcomed, not merely un-blocked.
 *
 * This is a strategic decision, not a default: a GEO agency's entire pitch is
 * getting cited by generative engines, which cannot happen if the models that
 * do the citing are denied access. Many sites now block these agents wholesale
 * and for this client that would contradict the product.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/styleguide", "/api/"] },
      ...AI_AGENTS.map((agent) => ({ userAgent: agent, allow: "/" })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
