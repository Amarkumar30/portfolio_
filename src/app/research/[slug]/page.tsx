/**
 * Research write-up page.
 * Props: route params containing the entry slug.
 * Used in: dynamic /research/[slug] routes.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntries, getEntry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

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

  return (
    <div className="container-shell py-12 sm:py-20">
      <article className="mx-auto max-w-[68ch] space-y-10">
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All research
        </Link>
        <header className="space-y-5 border-b pb-8">
          <p className="eyebrow">
            {entry.data.status}
            {entry.data.draft ? " · Draft" : ""}
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {entry.data.title}
          </h1>
          <p className="text-lg leading-8 text-muted">{entry.data.excerpt}</p>
          <p className="text-sm text-muted">
            Updated <time dateTime={entry.data.date}>{formatDate(entry.data.date)}</time>
          </p>
        </header>
        <div className="rich-text">{content}</div>
      </article>
    </div>
  );
}
