/**
 * Blog post page renders a single MDX article with syntax-highlighted code blocks.
 * Props: route params containing the post slug.
 * Used in: dynamic /blog/[slug] routes.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { buildMetadata } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return post
    ? buildMetadata({
        title: post.title,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
      })
    : {
        title: "Post not found",
      };
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container-shell py-12 sm:py-20">
      <article className="mx-auto max-w-[68ch] space-y-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All writing
        </Link>
        <header className="space-y-5 border-b pb-8">
          <p className="eyebrow">{post.category}</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-lg leading-8 text-muted">{post.excerpt}</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime}</span>
          </p>
        </header>
        <div className="rich-text">{post.content}</div>
      </article>
    </div>
  );
}
