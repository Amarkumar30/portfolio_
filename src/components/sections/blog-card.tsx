/**
 * BlogCard renders a post summary with tags and reading time metadata.
 * Props: one BlogPostMeta object.
 * Used in: home latest posts preview and the blog index page.
 * TODO: Add cover images later if you decide the blog needs stronger visual anchors.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="section-card group flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        <span>{post.category}</span>
        <span className="text-muted">{post.readingTime}</span>
      </div>
      <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
        {post.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border px-3 py-1 text-xs font-medium text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-6">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
        >
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
