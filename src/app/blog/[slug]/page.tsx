/**
 * Blog post page renders a single long-form article with reading progress, a table of contents
 * (for posts with three or more sections) and previous/next links.
 * Props: route params containing the post slug.
 * Used in: dynamic /blog/[slug] routes.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleFooter, ArticleHeader, ReadingLayout } from "@/components/reading/reading-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { getEntries, getEntry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { getH2Headings } from "@/lib/headings";
import { renderMdx } from "@/lib/mdx";
import { articleStructuredData, buildMetadata } from "@/lib/site";

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
        image: `/blog/${post.slug}/opengraph-image`,
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
  // Newest first, so the "previous" (older) post is the next one in the list.
  const posts = getEntries("blog");
  const index = posts.findIndex((entry) => entry.slug === post.slug);
  const neighbour = (offset: number) => {
    const entry = posts[index + offset];
    return entry ? { href: `/blog/${entry.slug}`, title: entry.data.title } : undefined;
  };

  return (
    <ReadingLayout headings={getH2Headings(post.body)} progress>
      <JsonLd
        data={articleStructuredData({
          type: "BlogPosting",
          title: post.data.title,
          description: post.data.excerpt,
          path: `/blog/${post.slug}`,
          date: post.data.date,
          tags: post.data.tags,
        })}
      />
      <ArticleHeader
        back={{ href: "/blog", label: "Writing" }}
        eyebrow={post.data.category}
        title={post.data.title}
        lead={post.data.excerpt}
        className="border-b pb-8"
        meta={[
          <time key="date" dateTime={post.data.date}>
            {formatDate(post.data.date)}
          </time>,
          post.readingTime,
          ...(post.data.tags.length > 0
            ? [
                <span key="tags" className="flex flex-wrap gap-x-2">
                  {post.data.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="underline decoration-border-strong underline-offset-4 hover:text-foreground"
                    >
                      #{tag}
                    </Link>
                  ))}
                </span>,
              ]
            : []),
          ...(post.data.draft ? [<span key="draft" className="text-accent">Draft</span>] : []),
        ]}
      />
      {post.data.cover ? (
        <Image
          src={post.data.cover}
          alt=""
          width={1360}
          height={714}
          priority
          sizes="(min-width: 768px) 680px, 100vw"
          className="mb-10 aspect-[1200/630] w-full rounded-card border object-cover"
        />
      ) : null}
      <div className="rich-text">{content}</div>
      <ArticleFooter
        previous={neighbour(1)}
        next={neighbour(-1)}
        back={{ href: "/blog", label: "Back to writing" }}
      />
    </ReadingLayout>
  );
}
