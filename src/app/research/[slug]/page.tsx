/**
 * Research write-up page, with reading progress, a table of contents and previous/next links.
 * Props: route params containing the entry slug.
 * Used in: dynamic /research/[slug] routes.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleFooter, ArticleHeader, ReadingLayout } from "@/components/reading/reading-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { getEntries, getEntry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { getH2Headings } from "@/lib/headings";
import { renderMdx } from "@/lib/mdx";
import { articleStructuredData, buildMetadata } from "@/lib/site";

interface ResearchEntryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ResearchEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry("research", slug);

  return entry
    ? buildMetadata({
        title: entry.data.title,
        description: entry.data.excerpt,
        path: `/research/${entry.slug}`,
        type: "article",
        image: `/research/${entry.slug}/opengraph-image`,
      })
    : { title: "Not found" };
}

export function generateStaticParams() {
  return getEntries("research").map((entry) => ({ slug: entry.slug }));
}

export default async function ResearchEntryPage({ params }: ResearchEntryPageProps) {
  const { slug } = await params;
  const entry = getEntry("research", slug);

  if (!entry) {
    notFound();
  }

  const content = await renderMdx(entry.body);
  const entries = getEntries("research");
  const index = entries.findIndex((item) => item.slug === entry.slug);
  const neighbour = (offset: number) => {
    const item = entries[index + offset];
    return item ? { href: `/research/${item.slug}`, title: item.data.title } : undefined;
  };

  return (
    <ReadingLayout headings={getH2Headings(entry.body)} progress>
      <JsonLd
        data={articleStructuredData({
          type: "ScholarlyArticle",
          title: entry.data.title,
          description: entry.data.excerpt,
          path: `/research/${entry.slug}`,
          date: entry.data.date,
          tags: entry.data.tags,
        })}
      />
      <ArticleHeader
        back={{ href: "/research", label: "Research" }}
        eyebrow={`${entry.data.status}${entry.data.draft ? " · Draft" : ""}`}
        title={entry.data.title}
        lead={entry.data.excerpt}
        className="border-b pb-8"
        meta={[
          <span key="date">
            Updated <time dateTime={entry.data.date}>{formatDate(entry.data.date)}</time>
          </span>,
          entry.readingTime,
        ]}
      />
      <div className="rich-text">{content}</div>
      <ArticleFooter
        previous={neighbour(1)}
        next={neighbour(-1)}
        back={{ href: "/research", label: "Back to research" }}
      />
    </ReadingLayout>
  );
}
