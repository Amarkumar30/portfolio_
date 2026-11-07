/**
 * normaliseStory turns a parser's raw story into a clean Story, or null if it can't be shown:
 * no title, an unsafe URL, no usable date, or on the deny-list.
 */
import type { FeedSource } from "./config";
import { canonicalUrl, plainText, storyId, toExcerpt } from "./sanitize";
import { classify, isDenied } from "./topics";
import type { RawStory, Story } from "./types";

/** Hacker News only links to articles; the article itself lives on this domain. */
function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function normaliseStory(raw: RawStory, source: FeedSource): Story | null {
  const title = plainText(raw.title);
  const url = canonicalUrl(raw.url);

  if (!title || !url || !raw.publishedAt) return null;

  const tags = (raw.tags ?? []).map(plainText).filter(Boolean);
  if (isDenied(title, tags)) return null;

  const excerpt = toExcerpt(raw.excerpt ?? "");
  const author = plainText(raw.author ?? "");
  const discussionUrl = raw.discussionUrl ? canonicalUrl(raw.discussionUrl) : null;

  return {
    id: storyId(url),
    title,
    url,
    source: source.name,
    sourceUrl: source.sourceUrl,
    publisher: source.kind === "hackernews" ? domainOf(url) : undefined,
    publishedAt: raw.publishedAt,
    excerpt,
    topics: classify(title, tags, excerpt, source.topics),
    author: author || undefined,
    score: raw.score,
    discussionUrl: discussionUrl ?? undefined,
  };
}
