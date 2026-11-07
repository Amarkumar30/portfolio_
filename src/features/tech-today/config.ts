/**
 * Tech Today — settings.
 * Set TECH_TODAY_ENABLED to false to remove the tab and make the routes return 404.
 * To add or remove a feed, edit SOURCES below; nothing else needs to change.
 */
export const TECH_TODAY_ENABLED = true;

export const TECH_TODAY_PATH = "/tech-today";

/** The list is rebuilt this often, on the first visit after it goes stale. */
export const REFRESH_SECONDS = 3 * 60 * 60;

/** A list older than this is rebuilt before it's shown; if that fails, the last good list stays. */
export const MAX_LIST_AGE_MS = 4 * 60 * 60 * 1000;

/** One source gives up after this long; the others are not affected. */
export const SOURCE_TIMEOUT_MS = 4000;

export const MAX_STORY_AGE_MS = 36 * 60 * 60 * 1000;
export const MAX_STORIES = 12;
export const MAX_PER_SOURCE = 3;
export const MAX_EXCERPT_LENGTH = 600;

/** How many Hacker News stories to look at, and how many to request at once. */
export const HN_STORY_COUNT = 30;
export const HN_CONCURRENCY = 10;

/** A pick stays pinned for this many days after its date. */
export const PICK_DAYS = 7;

export const USER_AGENT = "amarkumar.dev tech-today (+https://www.amarkumar.dev)";

export const HN_API = "https://hacker-news.firebaseio.com/v0";
export const DEVTO_API = "https://dev.to/api/articles?top=1&per_page=20";

export interface FeedSource {
  /** "feed" is any RSS or Atom URL; the two APIs have their own parsers. */
  kind: "feed" | "hackernews" | "devto";
  name: string;
  sourceUrl: string;
  feedUrl?: string;
  /** Topics every story from this source gets, for sources with a clear beat. */
  topics?: readonly ("India" | "Startups")[];
}

export const SOURCES: readonly FeedSource[] = [
  { kind: "hackernews", name: "Hacker News", sourceUrl: "https://news.ycombinator.com" },
  { kind: "devto", name: "DEV Community", sourceUrl: "https://dev.to" },
  {
    kind: "feed",
    name: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/feed/",
  },
  {
    kind: "feed",
    name: "The Verge",
    sourceUrl: "https://www.theverge.com",
    feedUrl: "https://www.theverge.com/rss/index.xml",
  },
  {
    kind: "feed",
    name: "Inc42",
    sourceUrl: "https://inc42.com",
    feedUrl: "https://inc42.com/feed/",
    topics: ["India", "Startups"],
  },
  {
    kind: "feed",
    name: "YourStory",
    sourceUrl: "https://yourstory.com",
    feedUrl: "https://yourstory.com/feed",
    topics: ["India", "Startups"],
  },
];
