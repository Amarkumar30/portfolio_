import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { projects } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/projects", "/blog", "/contact"].map(
    (path) => ({
      url: `${siteUrl}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
