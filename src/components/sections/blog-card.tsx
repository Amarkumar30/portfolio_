/**
 * BlogCard renders a post summary with category, date and reading time.
 * Props: one BlogPostMeta object.
 * Used in: home recent writing and the blog index page.
 */
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="section-card group relative flex h-full flex-col p-6 hover:border-accent/50">
      <p className="eyebrow">{post.category}</p>
      <h3 className="mt-3 font-heading text-xl font-semibold tracking-tight">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 text-base leading-7 text-muted">{post.excerpt}</p>
      <p className="mt-auto flex gap-2 pt-6 text-sm text-muted">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime}</span>
      </p>
    </article>
  );
}
