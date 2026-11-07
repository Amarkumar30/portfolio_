/**
 * Tech Today reading page: a story from the list, or one of Amar's picks. A story that has left
 * the list gets a friendly page rather than an error. All of these are noindex: they summarise
 * other sites' content.
 * Props: route params with the story id or pick slug.
 * Used in: /tech-today/[id] route.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PickArticle,
  RotatedOut,
  StoryArticle,
  TECH_TODAY_ENABLED,
  TECH_TODAY_PATH,
  findStory,
  getPick,
  getTechToday,
} from "@/features/tech-today";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

interface ReadingPageProps {
  params: Promise<{ id: string }>;
}

const MORE_STORIES = 4;

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  if (!TECH_TODAY_ENABLED) return {};

  const { id } = await params;
  const pick = getPick(id)?.pick;
  const story = findStory(await getTechToday(), id);
  const title = pick?.title ?? story?.title ?? "Story rotated out";
  const source = pick?.source ?? story?.source;

  return {
    ...buildMetadata({
      title,
      description: source ? `A story from ${source}, on Tech Today.` : "A story on Tech Today.",
      path: `${TECH_TODAY_PATH}/${id}`,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function TechTodayReadingPage({ params }: ReadingPageProps) {
  if (!TECH_TODAY_ENABLED) notFound();

  const { id } = await params;
  const now = new Date();
  const feed = await getTechToday();
  const others = (feed?.stories ?? []).filter((story) => story.id !== id).slice(0, MORE_STORIES);

  const entry = getPick(id);
  if (entry) {
    const content = entry.body ? await renderMdx(entry.body) : null;
    return <PickArticle pick={entry.pick} content={content} more={others} now={now} />;
  }

  const story = findStory(feed, id);
  return story ? <StoryArticle story={story} more={others} now={now} /> : <RotatedOut />;
}
