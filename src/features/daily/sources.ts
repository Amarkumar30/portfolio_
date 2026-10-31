/**
 * Server-only API clients for ZenQuotes and JokeAPI.
 * Each request: 3-second timeout, cached for a day per IST date, and never throws —
 * any failure returns null so the caller falls back to the curated list.
 */
import { API_CACHE_SECONDS, API_TIMEOUT_MS, JOKEAPI_URL, ZENQUOTES_TODAY_URL } from "./config";
import { approvedJokeApiIds } from "./curated";
import type { Joke, Quote } from "./types";

async function getJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      next: { revalidate: API_CACHE_SECONDS },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function decodeEntities(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** The date goes into the URL only to key the cache per IST day; both APIs ignore it. */
export async function fetchQuote(date: string): Promise<Quote | null> {
  const payload = await getJson(`${ZENQUOTES_TODAY_URL}?day=${date}`);
  const item = Array.isArray(payload) ? (payload[0] as { q?: unknown; a?: unknown }) : null;

  if (!item || typeof item.q !== "string" || typeof item.a !== "string") return null;
  // When rate-limited, ZenQuotes returns a notice "quote" authored by zenquotes.io.
  if (item.a.toLowerCase().includes("zenquotes")) return null;

  const text = decodeEntities(item.q);
  const author = decodeEntities(item.a);
  return text && author ? { text, author, source: "zenquotes" } : null;
}

export async function fetchJoke(date: string): Promise<Joke | null> {
  const payload = (await getJson(`${JOKEAPI_URL}&day=${date}`)) as {
    error?: boolean;
    safe?: boolean;
    id?: unknown;
    type?: string;
    joke?: unknown;
    setup?: unknown;
    delivery?: unknown;
  } | null;

  if (!payload || payload.error !== false || payload.safe !== true) return null;
  // Only jokes reviewed for this site (see approvedJokeApiIds in curated.ts).
  if (typeof payload.id !== "number" || !approvedJokeApiIds.has(payload.id)) return null;

  let joke: Joke | null = null;
  if (payload.type === "single" && typeof payload.joke === "string") {
    joke = { kind: "single", text: decodeEntities(payload.joke), source: "jokeapi" };
  } else if (
    payload.type === "twopart" &&
    typeof payload.setup === "string" &&
    typeof payload.delivery === "string"
  ) {
    joke = {
      kind: "twopart",
      setup: decodeEntities(payload.setup),
      punchline: decodeEntities(payload.delivery),
      source: "jokeapi",
    };
  }

  return joke;
}
