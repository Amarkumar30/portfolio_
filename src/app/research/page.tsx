/**
 * Research index: GEO research write-ups (Hinglish-GEO-Bench, IBVS, and what follows).
 * Props: none for the route component.
 * Used in: /research route.
 */
import type { Metadata } from "next";
import { EntryList } from "@/components/sections/entry-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Research",
  description:
    "Amar Kumar's research on Generative Engine Optimization: Hinglish-GEO-Bench and the Indian Brand Visibility Score (IBVS).",
  path: "/research",
});

export default function ResearchPage() {
  const entries = getEntries("research");

  return (
    <div className="container-shell page">
      <SectionHeading
        as="h1"
        eyebrow="Research"
        title="How brands get found when AI answers the question."
        description="I'm a research intern at South Asian University working on Generative Engine Optimization: how brands show up inside ChatGPT, Perplexity and Gemini, and how to measure it — especially for Indian brands and the way Indians actually ask."
      />
      <div className="mt-12 max-w-3xl">
        <EntryList
          rows={entries.map((entry) => ({
            href: `/research/${entry.slug}`,
            title: entry.data.title,
            date: entry.data.date,
            label: entry.data.status,
            excerpt: entry.data.excerpt,
            trailing: entry.readingTime,
          }))}
        />
      </div>
    </div>
  );
}
