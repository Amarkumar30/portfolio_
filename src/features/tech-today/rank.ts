/**
 * selectStories turns everything the sources returned into the day's list: recent stories only,
 * no duplicates, best first, and no more than a few from any one source.
 */
import { MAX_PER_SOURCE, MAX_STORIES, MAX_STORY_AGE_MS } from "./config";
import { titleKey, urlKey } from "./sanitize";
import type { Story, Topic } from "./types";

/** How much each topic matters to this site; a story counts its best two. */
const TOPIC_WEIGHT: Record<Topic, number> = {
  Search: 1,
  AI: 0.8,
  India: 0.8,
  Startups: 0.6,
  Dev: 0.6,
  Security: 0.6,
};

function ageMs(story: Story, now: Date) {
  return now.getTime() - Date.parse(story.publishedAt);
}

export function isRecent(story: Story, now: Date) {
  return ageMs(story, now) <= MAX_STORY_AGE_MS;
}

/** Recency and topic are each worth about 1; a 1,000-point HN story adds about 1 more. */
export function storyScore(story: Story, now: Date) {
  const recency = 1 - Math.max(0, ageMs(story, now)) / MAX_STORY_AGE_MS;
  const popularity = story.score ? Math.min(1, Math.log10(story.score + 1) / 3) : 0;
  const [first, second] = story.topics.map((topic) => TOPIC_WEIGHT[topic]).sort((a, b) => b - a);
  const relevance = (first ?? 0) + (second ?? 0) / 2;

  return recency + popularity + relevance;
}

/**
 * Keeps the first copy of each story. If a later copy has the summary the first one lacks, it takes
 * over and keeps the score and discussion link: Hacker News often links to a story a feed also has.
 */
export function dedupe(stories: Story[]) {
  const kept: Story[] = [];
  const slots = new Map<string, number>();

  for (const story of stories) {
    const keys = [`url:${urlKey(story.url)}`, `title:${titleKey(story.title)}`];
    const slot = keys.map((key) => slots.get(key)).find((value) => value !== undefined);

    if (slot === undefined) {
      keys.forEach((key) => slots.set(key, kept.length));
      kept.push(story);
    } else if (!kept[slot].excerpt && story.excerpt) {
      kept[slot] = { ...story, score: kept[slot].score, discussionUrl: kept[slot].discussionUrl };
    }
  }

  return kept;
}

export function selectStories(stories: Story[], now: Date) {
  const ranked = stories
    .filter((story) => isRecent(story, now))
    .map((story) => ({ story, score: storyScore(story, now) }))
    .sort((a, b) => b.score - a.score)
    .map(({ story }) => story);

  const perSource = new Map<string, number>();

  return dedupe(ranked)
    .filter((story) => {
      const count = perSource.get(story.source) ?? 0;
      perSource.set(story.source, count + 1);
      return count < MAX_PER_SOURCE;
    })
    .slice(0, MAX_STORIES);
}
