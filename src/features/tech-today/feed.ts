/**
 * buildFeed makes a fresh list and resolveFeed decides what a visitor gets. Neither depends on
 * Next, so the failure paths can be tested; cache.ts connects them to the cache.
 */
import { MAX_LIST_AGE_MS } from "./config";
import { selectStories } from "./rank";
import { fetchAllSources } from "./sources";
import type { Feed } from "./types";

/** Throws when there's nothing to show, so a failed refresh can't replace the last good list. */
export async function buildFeed(now = new Date()): Promise<Feed> {
  const stories = selectStories(await fetchAllSources(), now);

  if (stories.length === 0) throw new Error("[tech-today] every source failed or came back empty");

  return { updatedAt: now.toISOString(), stories };
}

function isTooOld(feed: Feed, now: Date) {
  return now.getTime() - Date.parse(feed.updatedAt) > MAX_LIST_AGE_MS;
}

/**
 * `read` returns the stored list, building one if there's none, and throws if that fails.
 * A stored list can be any age after a quiet spell, so one past the limit is rebuilt here rather
 * than shown; if the rebuild fails, the last good list stays. Null means nothing has ever worked.
 */
export async function resolveFeed(
  read: () => Promise<Feed>,
  rebuild: () => Promise<Feed>,
  now = new Date(),
): Promise<Feed | null> {
  let stored: Feed;

  try {
    stored = await read();
  } catch (error) {
    console.error("[tech-today] no list available", error);
    return null;
  }

  if (!isTooOld(stored, now)) return stored;

  try {
    return await rebuild();
  } catch (error) {
    console.error("[tech-today] keeping the last good list", error);
    return stored;
  }
}

export function findStory(feed: Feed | null, id: string) {
  return feed?.stories.find((story) => story.id === id) ?? null;
}
