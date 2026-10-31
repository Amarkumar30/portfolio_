/**
 * Writing index: long-form essays with tag filtering. Notes live on the sibling /notes tab.
 * Props: optional searchParams for tag filtering.
 * Used in: /blog route.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { EntryList } from "@/components/sections/entry-list";
import { WritingTabs } from "@/components/sections/writing-tabs";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries, getTags } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/site";

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

  return (
    <div className="container-shell page">
      <SectionHeading
        as="h1"
        eyebrow="Writing"
        title="Notes on GEO, engineering, and building things."
        description="Long-form pieces on how AI answers are changing discovery, what I learn while building, and the occasional startup idea."
      />

      <div className="mt-12 max-w-3xl space-y-8">
        <WritingTabs active="blog" />

        {tags.length > 1 ? (
          <nav aria-label="Filter by tag" className="flex flex-wrap gap-2">
            <Link href="/blog" className="chip" aria-current={!activeTag ? "page" : undefined}>
              All
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="chip"
                aria-current={activeTag === tag ? "page" : undefined}
              >
                {tag}
              </Link>
            ))}
          </nav>
        ) : null}

        {filteredPosts.length > 0 ? (
          <EntryList
            rows={filteredPosts.map((post) => ({
              href: `/blog/${post.slug}`,
              title: post.data.title,
              date: post.data.date,
              excerpt: post.data.excerpt,
              trailing: post.readingTime,
            }))}
          />
        ) : (
          <p className="border-y py-8 text-muted">
            No posts tagged &ldquo;{activeTag}&rdquo; yet.{" "}
            <Link href="/blog" className="link">
              See all writing
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
