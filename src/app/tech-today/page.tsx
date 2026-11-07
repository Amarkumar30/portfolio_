/**
 * Tech Today: the day's top tech headlines from public feeds, with an optional pinned pick.
 * Filtering uses ?topic= so it works without JavaScript; the list itself is cached (see
 * features/tech-today/cache.ts), so this route being dynamic doesn't add any source requests.
 * Props: optional searchParams for topic filtering.
 * Used in: /tech-today route (the "Tech Today" tab under Writing).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WritingTabs } from "@/components/sections/writing-tabs";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  PickCard,
  StoryList,
  TECH_TODAY_ENABLED,
  TECH_TODAY_PATH,
  TOPICS,
  formatIst,
  getPicks,
  getTechToday,
  latestPick,
} from "@/features/tech-today";
import { buildMetadata } from "@/lib/site";

interface TechTodayPageProps {
  searchParams: Promise<{ topic?: string | string[] }>;
}

export const metadata: Metadata = buildMetadata({
  title: "Tech Today",
  description: "Top tech stories from across the web, refreshed every few hours.",
  path: TECH_TODAY_PATH,
});

export default async function TechTodayPage({ searchParams }: TechTodayPageProps) {
  if (!TECH_TODAY_ENABLED) notFound();

  const { topic } = await searchParams;
  const activeTopic = TOPICS.find((item) => item.toLowerCase() === String(topic).toLowerCase());

  const now = new Date();
  const feed = await getTechToday();
  const pick = latestPick(getPicks(), now);
  const stories = (feed?.stories ?? []).filter(
    (story) => !activeTopic || story.topics.includes(activeTopic),
  );

  return (
    <div className="container-shell page">
      <SectionHeading
        as="h1"
        eyebrow="Tech Today"
        title="What's happening in tech"
        description="Top stories from across the web, refreshed every few hours."
      />
      {feed ? (
        <p className="meta mt-4">
          Updated <time dateTime={feed.updatedAt}>{formatIst(feed.updatedAt)}</time> IST
        </p>
      ) : null}

      <div className="mt-12 max-w-3xl space-y-8">
        <WritingTabs active="tech-today" />

        {pick ? <PickCard pick={pick} /> : null}

        {feed ? (
          <>
            <nav aria-label="Filter by topic" className="flex flex-wrap gap-2">
              <Link
                href={TECH_TODAY_PATH}
                className="chip"
                aria-current={!activeTopic ? "page" : undefined}
              >
                All
              </Link>
              {TOPICS.map((item) => (
                <Link
                  key={item}
                  href={`${TECH_TODAY_PATH}?topic=${item.toLowerCase()}`}
                  className="chip"
                  aria-current={activeTopic === item ? "page" : undefined}
                >
                  {item}
                </Link>
              ))}
            </nav>

            {stories.length > 0 ? (
              <StoryList stories={stories} now={now} />
            ) : (
              <p className="border-y py-8 text-muted">
                No {activeTopic} stories in today&apos;s list.{" "}
                <Link href={TECH_TODAY_PATH} className="link">
                  See all of them
                </Link>
                .
              </p>
            )}
          </>
        ) : (
          <p className="border-y py-8 text-muted">
            Today&apos;s tech headlines are taking a break. Check back soon.{" "}
            <Link href="/blog" className="link">
              Back to Writing
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
