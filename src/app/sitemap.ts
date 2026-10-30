import type { MetadataRoute } from "next";
import { getEntries, getSingle } from "@/lib/content/loader";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/projects",
    "/research",
    "/blog",
    "/notes",
    "/contact",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const now = getSingle("now");
  const nowRoute: MetadataRoute.Sitemap = now
    ? [{ url: `${siteUrl}/now`, lastModified: now.data.updated, changeFrequency: "monthly", priority: 0.5 }]
    : [];

  const entryRoutes = (["blog", "projects", "research"] as const).flatMap((section) =>
    getEntries(section).map((entry) => ({
      url: `${siteUrl}/${section}/${entry.slug}`,
      lastModified: entry.data.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...staticRoutes, ...nowRoute, ...entryRoutes];
}
