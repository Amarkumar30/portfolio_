/**
 * Writing index: long-form essays with tag filtering. Notes live on the sibling /notes tab.
 * Props: optional searchParams for tag filtering.
 * Used in: /blog route.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ContentCard } from "@/components/sections/content-card";
import { WritingTabs } from "@/components/sections/writing-tabs";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries, getTags } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
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
  const posts = getEntries("blog");
  const tags = getTags("blog");
  const filteredPosts = activeTag
    ? posts.filter((post) => post.data.tags.includes(activeTag))
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

      <WritingTabs active="blog" />

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
        {filteredPosts.map((post) => (
          <Reveal key={post.slug}>
            <ContentCard
              href={`/blog/${post.slug}`}
              eyebrow={post.data.category}
              title={post.data.title}
              summary={post.data.excerpt}
              meta={[formatDate(post.data.date, "short"), post.readingTime]}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
