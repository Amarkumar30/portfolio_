export const TOPICS = ["AI", "Startups", "India", "Dev", "Security", "Search"] as const;

export type Topic = (typeof TOPICS)[number];

/** A story as it comes out of a parser: untrusted, and may still contain HTML. */
export interface RawStory {
  title: string;
  url: string;
  publishedAt: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  score?: number;
  discussionUrl?: string;
}

/** A clean story: plain text, safe URLs, ready to rank and show. */
export interface Story {
  /** Short hash of the canonical URL; also the reading page's URL. */
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  /** Who published the article, when that isn't `source` (Hacker News only links to it). */
  publisher?: string;
  publishedAt: string;
  excerpt: string;
  /** Every topic that matched, most relevant first. Empty for general tech stories. */
  topics: Topic[];
  author?: string;
  score?: number;
  discussionUrl?: string;
}

export interface Feed {
  /** When this list was built (ISO). Stays honest when an old list is being kept. */
  updatedAt: string;
  stories: Story[];
}

/** An "Amar's pick" entry from content/tech-picks. */
export interface TechPick {
  slug: string;
  title: string;
  url: string;
  source: string;
  date: string;
  note: string;
  draft: boolean;
}
