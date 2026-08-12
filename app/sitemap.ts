import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Routes that exist today. Extend as interior pages land in phase 2, and
 * generate the Resources entries from Sanity once the CMS is wired.
 */
const routes: { path: string; priority: number; freq: "weekly" | "monthly" }[] =
  [{ path: "/", priority: 1, freq: "weekly" }];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
