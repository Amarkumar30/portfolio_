/**
 * Blog index page lists MDX-backed posts and exposes tags for lightweight categorization.
 * Props: optional searchParams for tag filtering.
 * Used in: /blog route.
 * TODO: Expand into dedicated tag archive routes if the blog grows substantially.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/sections/blog-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { buildMetadata } from "@/lib/site";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Read Amar Kumar's MDX-powered notes on Generative Engine Optimization, engineering decisions, startup ideas, and learning in public.",
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

  return (
    <div className="container-shell space-y-12 py-10 sm:py-14">
      <Reveal className="section-card p-8 sm:p-10">
        <SectionHeading
          eyebrow="Blog"
          title="Writing powered by local MDX files, built for fast iteration."
          description="Each post stores frontmatter, tags, and content in /content/blog. This keeps v1 lightweight while still supporting custom React components."
        />
      </Reveal>

      <section className="section-card p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              !activeTag ? "border-accent bg-accent text-accent-foreground" : ""
            }`}
          >
            All posts
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                activeTag === tag ? "border-accent bg-accent text-accent-foreground" : ""
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredPosts.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.08}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
