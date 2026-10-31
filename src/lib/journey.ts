/**
 * Journey milestones for the About page timeline (server-only).
 * Order: by date (YYYY / YYYY-MM, oldest first); milestones without a date are placed by their
 * position ("order"), which also breaks ties. "Now" milestones always come last, and take their
 * summary and story from content/now.mdx so they never go stale.
 */
import { getEntries, getSingle, type Entry } from "@/lib/content/loader";
import type { JourneyKind } from "@/lib/content/sections";
import { formatPartialDate } from "@/lib/format";

export interface Milestone {
  slug: string;
  title: string;
  date?: string;
  /** "2026", "Aug 2026", or for Now "Updated Oct 2026"; undefined hides the label. */
  dateLabel?: string;
  summary: string;
  kind: JourneyKind;
  highlight: boolean;
  links: { label: string; href: string }[];
  image?: string;
  imageAlt?: string;
  /** Markdown/MDX story. For Now milestones, the story is followed by the Now page content. */
  body: string;
  isNow: boolean;
  /** The current Now page body, for Now milestones. */
  nowBody?: string;
}

const position = (entry: Entry<"journey">) => entry.data.order ?? Number.POSITIVE_INFINITY;

function compare(a: Entry<"journey">, b: Entry<"journey">) {
  const { date: dateA } = a.data;
  const { date: dateB } = b.data;

  // "2024" sorts before "2024-08", which sorts before "2025": plain string order works.
  if (dateA && dateB && dateA !== dateB) return dateA < dateB ? -1 : 1;

  const byPosition = position(a) - position(b);
  if (byPosition && !Number.isNaN(byPosition)) return byPosition;
  return a.slug.localeCompare(b.slug);
}

/** First list item (or first line) of a Markdown body, as plain text. */
function firstLine(markdown: string) {
  const line = markdown
    .split(/\r?\n/)
    .map((text) => text.trim())
    .find((text) => text && !text.startsWith("#") && !text.startsWith("{/*"));

  return line
    ?.replace(/^[-*+]\s+|^\d+\.\s+/, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

export function getJourney(): Milestone[] {
  const entries = getEntries("journey");
  const now = getSingle("now");

  const toMilestone = (entry: Entry<"journey">): Milestone => {
    const isNow = entry.data.kind === "now";
    const nowSummary = isNow && now ? firstLine(now.body) : undefined;

    return {
      slug: entry.slug,
      title: entry.data.title,
      date: entry.data.date,
      dateLabel: isNow
        ? now
          ? `Updated ${formatPartialDate(now.data.updated.slice(0, 7))}`
          : undefined
        : entry.data.date
          ? formatPartialDate(entry.data.date)
          : undefined,
      summary: nowSummary || entry.data.summary,
      kind: entry.data.kind,
      highlight: entry.data.highlight,
      links: entry.data.links,
      image: entry.data.image,
      imageAlt: entry.data.imageAlt,
      body: entry.body,
      isNow,
      nowBody: isNow ? now?.body : undefined,
    };
  };

  const milestones = entries.filter((entry) => entry.data.kind !== "now").sort(compare);
  const nowMilestones = entries.filter((entry) => entry.data.kind === "now").sort(compare);

  return [...milestones, ...nowMilestones].map(toMilestone);
}
