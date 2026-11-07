/**
 * Server-only clients for every source in config.ts.
 * Each source gets a 4-second budget and its own try/catch, so one failing can't affect the rest.
 */
import {
  DEVTO_API,
  HN_API,
  HN_CONCURRENCY,
  HN_STORY_COUNT,
  SOURCES,
  SOURCE_TIMEOUT_MS,
  USER_AGENT,
  type FeedSource,
} from "./config";
import { normaliseStory } from "./normalise";
import { parseDevTo, parseFeedXml, parseHnItem } from "./parse";
import type { RawStory, Story } from "./types";

async function request(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal,
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response;
}

async function mapWithLimit<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
  const results: R[] = [];
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      results.push(await run(item));
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function fetchHackerNews(signal: AbortSignal) {
  const ids = (await (await request(`${HN_API}/topstories.json`, signal)).json()) as number[];

  // A slow item is skipped, so a timeout part-way through still keeps the stories already fetched.
  const items = await mapWithLimit(ids.slice(0, HN_STORY_COUNT), HN_CONCURRENCY, async (id) => {
    try {
      return parseHnItem(await (await request(`${HN_API}/item/${id}.json`, signal)).json());
    } catch {
      return null;
    }
  });

  return items.filter((item): item is RawStory => item !== null);
}

async function fetchRaw(source: FeedSource, signal: AbortSignal) {
  if (source.kind === "hackernews") return fetchHackerNews(signal);
  if (source.kind === "devto") return parseDevTo(await (await request(DEVTO_API, signal)).json());
  return parseFeedXml(await (await request(source.feedUrl ?? "", signal)).text());
}

/** Never throws: a source that fails returns no stories. */
async function fetchSource(source: FeedSource): Promise<Story[]> {
  try {
    const raw = await fetchRaw(source, AbortSignal.timeout(SOURCE_TIMEOUT_MS));
    return raw.flatMap((item) => normaliseStory(item, source) ?? []);
  } catch (error) {
    console.warn(`[tech-today] ${source.name} failed:`, error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchAllSources(sources: readonly FeedSource[] = SOURCES) {
  return (await Promise.all(sources.map(fetchSource))).flat();
}
