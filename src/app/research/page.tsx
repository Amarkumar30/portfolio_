/**
 * Research index: GEO research write-ups (Hinglish-GEO-Bench, IBVS, and what follows).
 * Props: none for the route component.
 * Used in: /research route.
 */
import type { Metadata } from "next";
import { ContentCard } from "@/components/sections/content-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
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
    <div className="container-shell space-y-12 py-12 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Research"
        title="How brands get found when AI answers the question."
        description="I'm a research intern at South Asian University working on Generative Engine Optimization: how brands show up inside ChatGPT, Perplexity and Gemini, and how to measure it — especially for Indian brands and the way Indians actually ask."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {entries.map((entry) => (
          <Reveal key={entry.slug}>
            <ContentCard
              href={`/research/${entry.slug}`}
              eyebrow={entry.data.status}
              title={entry.data.title}
              summary={entry.data.excerpt}
              meta={[`Updated ${formatDate(entry.data.date, "short")}`]}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
