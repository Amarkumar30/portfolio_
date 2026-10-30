/**
 * Now page: what Amar is focused on this month. Same content as the home page "Now" block.
 * Props: none for the route component.
 * Used in: /now route.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSingle } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Now",
  description: "What Amar Kumar is working on and focused on right now.",
  path: "/now",
});

export default async function NowPage() {
  const now = getSingle("now");

  if (!now) {
    notFound();
  }

  const content = await renderMdx(now.body);

  return (
    <div className="container-shell py-12 sm:py-20">
      <div className="max-w-[68ch] space-y-8">
        <SectionHeading
          as="h1"
          eyebrow={`Updated ${formatDate(now.data.updated, "month")}`}
          title="What I'm doing now"
        />
        <div className="rich-text">{content}</div>
      </div>
    </div>
  );
}
