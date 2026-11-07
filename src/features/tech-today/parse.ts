/**
 * Parsers for each source's response shape. They only pick fields out; cleaning happens in
 * normalise.ts. Summaries come from <description> or <summary> and nothing else: content:encoded
 * and Atom <content> hold the full article, which isn't ours to republish.
 */
import { XMLParser } from "fast-xml-parser";
import type { RawStory } from "./types";

const ATTRIBUTE = "@_";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ATTRIBUTE,
  // Text stays as written: entities are decoded by sanitize.ts, and titles like "2026" stay strings.
  processEntities: false,
  parseTagValue: false,
  parseAttributeValue: false,
  isArray: (name) => ["item", "entry", "link", "category"].includes(name),
});

type XmlNode = Record<string, unknown>;

function text(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return text(node[0]);
  if (node && typeof node === "object") return text((node as XmlNode)["#text"]);
  return "";
}

function list(node: unknown): unknown[] {
  if (Array.isArray(node)) return node;
  return node === undefined || node === null ? [] : [node];
}

function isoDate(value: string) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? "" : new Date(time).toISOString();
}

function fromRssItem(item: XmlNode): RawStory {
  return {
    title: text(item.title),
    url: text(item.link),
    publishedAt: isoDate(text(item.pubDate) || text(item["dc:date"])),
    excerpt: text(item.description),
    author: text(item["dc:creator"]) || text(item.author),
    tags: list(item.category).map(text),
  };
}

function fromAtomEntry(entry: XmlNode): RawStory {
  const links = list(entry.link) as XmlNode[];
  const link = links.find((candidate) => (candidate[`${ATTRIBUTE}rel`] ?? "alternate") === "alternate");

  return {
    title: text(entry.title),
    url: text(link?.[`${ATTRIBUTE}href`]),
    publishedAt: isoDate(text(entry.published) || text(entry.updated)),
    excerpt: text(entry.summary),
    author: text((entry.author as XmlNode | undefined)?.name),
    tags: list(entry.category).map((category) => text((category as XmlNode)[`${ATTRIBUTE}term`])),
  };
}

/** Any RSS 2.0 or Atom document. Throws if it's neither. */
export function parseFeedXml(xml: string): RawStory[] {
  const document = parser.parse(xml) as {
    rss?: { channel?: { item?: XmlNode[] } };
    feed?: { entry?: XmlNode[] };
  };

  if (document.rss?.channel) return (document.rss.channel.item ?? []).map(fromRssItem);
  if (document.feed) return (document.feed.entry ?? []).map(fromAtomEntry);
  throw new Error("Not an RSS or Atom document");
}

export function parseDevTo(payload: unknown): RawStory[] {
  if (!Array.isArray(payload)) throw new Error("Unexpected dev.to response");

  return payload.flatMap((article: XmlNode) =>
    typeof article?.title === "string" && typeof article.url === "string"
      ? [
          {
            title: article.title,
            url: article.url,
            publishedAt: isoDate(text(article.published_at)),
            excerpt: text(article.description),
            author: text((article.user as XmlNode | undefined)?.name),
            tags: list(article.tag_list).map(text),
          },
        ]
      : [],
  );
}

/** One Hacker News item, or null unless it's a story that links out. */
export function parseHnItem(payload: unknown): RawStory | null {
  const item = payload as XmlNode | null;

  if (item?.type !== "story" || typeof item.url !== "string" || typeof item.title !== "string") {
    return null;
  }

  return {
    title: item.title,
    url: item.url,
    publishedAt: typeof item.time === "number" ? new Date(item.time * 1000).toISOString() : "",
    author: text(item.by),
    score: typeof item.score === "number" ? item.score : undefined,
    discussionUrl: `https://news.ycombinator.com/item?id=${item.id}`,
  };
}
