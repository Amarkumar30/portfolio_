/**
 * Blog post page renders a single MDX article with syntax-highlighted code blocks.
 * Props: route params containing the post slug.
 * Used in: dynamic /blog/[slug] routes.
 * TODO: Add prev/next post navigation if the content library grows.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
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
        title: "Blog post",
        description: "Blog post.",
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
    <div className="container-shell py-10 sm:py-14">
      <Reveal className="mx-auto max-w-4xl space-y-8">
        <header className="section-card p-8 sm:p-10">
          <span className="eyebrow">{post.category}</span>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>{post.readingTime}</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </header>
        <article className="section-card rich-text p-8 sm:p-10">{post.content}</article>
      </Reveal>
    </div>
  );
}
