/**
 * Blog index page lists long-form posts with tag filtering.
 * Props: optional searchParams for tag filtering.
 * Used in: /blog route.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/sections/blog-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { buildMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export const metadata: Metadata = buildMetadata({
  title: "Writing",
  description:
    "Essays by Amar Kumar on Generative Engine Optimization, AI search, software engineering, and building products in India.",
  path: "/blog",
});

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const activeTag = params.tag;
  const posts = getAllPosts();
  const tags = getAllTags();
  const filteredPosts = activeTag
    ? posts.filter((post) => post.tags.includes(activeTag))
    : posts;

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent",
      active && "border-accent text-accent",
    );

  return (
    <div className="container-shell space-y-10 py-12 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Writing"
        title="Notes on GEO, engineering, and building things."
        description="Long-form pieces on how AI answers are changing discovery, what I learn while building, and the occasional startup idea."
      />

      {tags.length > 1 ? (
        <nav aria-label="Filter by tag" className="flex flex-wrap gap-2">
          <Link href="/blog" className={chip(!activeTag)} aria-current={!activeTag ? "page" : undefined}>
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={chip(activeTag === tag)}
              aria-current={activeTag === tag ? "page" : undefined}
            >
              {tag}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {filteredPosts.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.05}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
