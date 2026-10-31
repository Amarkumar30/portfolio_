/**
 * Now page: what Amar is focused on this month. Same content as the home page "Now" block.
 * Props: none for the route component.
 * Used in: /now route.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <div className="container-shell page">
      <div className="reading-column">
        <p className="eyebrow mb-3">Now</p>
        <h1 className="text-h1 font-semibold">What I&apos;m doing now</h1>
        <p className="meta mt-4">
          Updated <time dateTime={now.data.updated}>{formatDate(now.data.updated, "month")}</time>
        </p>
        <div className="rich-text mt-10 border-t pt-10">{content}</div>
      </div>
    </div>
  );
}
