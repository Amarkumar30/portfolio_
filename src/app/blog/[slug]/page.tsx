/**
 * Blog post page renders a single long-form article.
 * Props: route params containing the post slug.
 * Used in: dynamic /blog/[slug] routes.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntries, getEntry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getEntry("blog", slug);

  return post
    ? buildMetadata({
        title: post.data.title,
        description: post.data.excerpt,
        path: `/blog/${post.slug}`,
        type: "article",
      })
    : { title: "Post not found" };
}

export function generateStaticParams() {
  return getEntries("blog").map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getEntry("blog", slug);

  if (!post) {
    notFound();
  }

  const content = await renderMdx(post.body);

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
          <p className="eyebrow">{post.data.category}</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {post.data.title}
          </h1>
          <p className="text-lg leading-8 text-muted">{post.data.excerpt}</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            <time dateTime={post.data.date}>{formatDate(post.data.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime}</span>
            {post.data.draft ? <span className="font-semibold text-accent">Draft</span> : null}
          </p>
        </header>
        {post.data.cover ? (
          <Image
            src={post.data.cover}
            alt=""
            width={1200}
            height={630}
            priority
            className="h-auto w-full rounded-xl border"
          />
        ) : null}
        <div className="rich-text">{content}</div>
      </article>
    </div>
  );
}
