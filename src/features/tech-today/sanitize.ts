/**
 * Everything from a feed is untrusted. These helpers turn it into plain text and safe URLs.
 * Feed text is only ever rendered as React text, never as HTML.
 */
import { createHash } from "node:crypto";
import { MAX_EXCERPT_LENGTH } from "./config";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(text: string) {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== "#") return NAMED_ENTITIES[entity.toLowerCase()] ?? match;

    const hex = entity[1] === "x" || entity[1] === "X";
    const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
}

function stripTags(text: string) {
  return text
    .replace(/<!--[\s\S]*?(-->|$)/g, " ")
    .replace(/<(script|style)\b[\s\S]*?(<\/\1\s*>|$)/gi, " ")
    .replace(/<\/?[a-z!][^>]*(>|$)/gi, " ");
}

/** Text with all HTML removed. Repeats so that an entity-encoded tag can't survive one pass. */
export function plainText(value: string) {
  let text = value;

  for (let pass = 0; pass < 3; pass += 1) {
    const next = stripTags(decodeEntities(text));
    if (next === text) break;
    text = next;
  }

  return text.replace(/\s+/g, " ").trim();
}

/** Feed boilerplate that isn't part of the summary. */
function dropBoilerplate(text: string) {
  return text
    .replace(/\s*The post .{1,300} appeared first on .{1,100}$/i, "")
    .replace(/\s*(Continue reading|Read more)\b.{0,100}$/i, "")
    .replace(/\s*\[(…|\.\.\.)\]\s*$/, "…")
    .trim();
}

/** Cuts at a sentence end if one is close to the limit, otherwise at a word. */
export function toExcerpt(value: string, max = MAX_EXCERPT_LENGTH) {
  const text = dropBoilerplate(plainText(value));
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  const end = sentenceEnd >= max * 0.6 ? sentenceEnd : cut.lastIndexOf(" ");

  return `${cut.slice(0, end > 0 ? end : max).replace(/[\s.,;:!?–—-]+$/, "")}…`;
}

const TRACKING_PARAM = /^(utm_.+|ref|fbclid|gclid)$/i;

/** The URL with tracking removed, or null unless it's http(s). */
export function canonicalUrl(value: string) {
  let url: URL;

  try {
    // Feed XML escapes & in links, which would otherwise hide the tracking parameters.
    url = new URL(decodeEntities(value).trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
  }
  url.hash = "";
  url.username = "";
  url.password = "";

  return url.toString();
}

/** Same page, however it's spelled: no www, no trailing slash, no scheme. */
export function urlKey(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/(?=\?|$)/, "")
    .toLowerCase();
}

export function titleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function storyId(url: string) {
  return createHash("sha256").update(urlKey(url)).digest("hex").slice(0, 10);
}
