/**
 * Ranking and failure handling, with every source mocked from fixtures (no network).
 * The memory store below behaves like the real one: read() returns what's stored even if it's
 * stale, and a failed build leaves it in place.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { MAX_LIST_AGE_MS, MAX_PER_SOURCE, MAX_STORIES } from "./config";
import { buildFeed, findStory, resolveFeed } from "./feed";
import { dedupe, selectStories, storyScore } from "./rank";
import type { Feed, Story, Topic } from "./types";

const NOW = new Date("2026-11-07T06:00:00Z");
const HOUR = 60 * 60 * 1000;

const fixture = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), "src/features/tech-today/__fixtures__", name), "utf8");

const routes: [RegExp, () => string][] = [
  [/topstories\.json/, () => fixture("hn-top.json")],
  [/item\/(\d+)\.json/, () => ""],
  [/dev\.to/, () => fixture("devto.json")],
  [/techcrunch\.com/, () => fixture("techcrunch.xml")],
  [/theverge\.com/, () => fixture("verge.xml")],
  [/inc42\.com/, () => fixture("inc42.xml")],
  [/yourstory\.com/, () => fixture("yourstory.xml")],
];

const realFetch = globalThis.fetch;
const realWarn = console.warn;
const realError = console.error;
let requested: { url: string; userAgent: string | null }[] = [];

/** Sources whose URL matches `down` fail; ones matching `hang` wait for the timeout signal. */
function mockSources({ down, hang }: { down?: RegExp; hang?: RegExp } = {}) {
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    requested.push({ url, userAgent: new Headers(init?.headers).get("User-Agent") });

    if (hang?.test(url)) {
      return new Promise((_, reject) => {
        // AbortSignal.timeout alone doesn't keep the test process alive; a server is always alive.
        const keepAlive = setTimeout(() => {}, 10_000);
        init?.signal?.addEventListener("abort", () => {
          clearTimeout(keepAlive);
          reject(new Error("timed out"));
        });
      });
    }
    if (down?.test(url)) return new Response("Bad gateway", { status: 502 });

    const item = /item\/(\d+)\.json/.exec(url);
    if (item) return new Response(JSON.stringify(JSON.parse(fixture("hn-items.json"))[item[1]]));

    const route = routes.find(([pattern]) => pattern.test(url));
    assert.ok(route, `unexpected request: ${url}`);
    return new Response(route[1]());
  }) as typeof fetch;
}

const EVERYTHING = /./;

beforeEach(() => {
  requested = [];
  console.warn = () => {};
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.warn = realWarn;
  console.error = realError;
});

function story(index: number, overrides: Partial<Story> = {}): Story {
  return {
    id: `id${index}`,
    title: `Story number ${index} with a distinct name ${"x".repeat(index)}`,
    url: `https://example.com/${index}`,
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    publishedAt: new Date(NOW.getTime() - HOUR).toISOString(),
    excerpt: "",
    topics: [],
    ...overrides,
  };
}

/** Same behaviour as unstable_cache with one fixed key. */
function memoryStore(build: () => Promise<Feed>, initial: Feed | null = null) {
  let stored = initial;

  return async () => {
    if (stored) return stored;
    stored = await build();
    return stored;
  };
}

test("the whole pipeline: every source, cleaned, deduped, filtered", async () => {
  mockSources();
  const feed = await buildFeed(NOW);
  const titles = feed.stories.map((item) => item.title);

  assert.equal(feed.updatedAt, NOW.toISOString());
  assert.deepEqual(new Set(feed.stories.map((item) => item.source)), new Set(["Hacker News", "DEV Community", "TechCrunch", "The Verge", "Inc42", "YourStory"]));
  assert.ok(!titles.includes("Old news from last week about AI"));
  assert.ok(!titles.includes("Best deals on laptops this weekend"));
  assert.ok(!titles.includes("A story that has no date"));
  assert.ok(!titles.includes("An entertainment story"));
  assert.ok(!titles.includes("Ask HN: A post with no link"));
  // The HN link to the TechCrunch story collapses into one, however the URLs are spelled.
  assert.equal(feed.stories.filter((item) => item.url.includes("fixture-seed-round")).length, 1);

  const hn = feed.stories.find((item) => item.title === "Show HN: A compiler fixture");
  assert.equal(hn?.url, "https://example.com/compiler");
  assert.equal(hn?.publisher, "example.com");
  assert.equal(hn?.excerpt, "");
});

test("requests send the plain User-Agent, with no email address", async () => {
  mockSources();
  await buildFeed(NOW);

  assert.ok(requested.length > 6);
  for (const { userAgent } of requested) {
    assert.equal(userAgent, "amarkumar.dev tech-today (+https://www.amarkumar.dev)");
  }
});

test("one source failing doesn't affect the others", async () => {
  mockSources({ down: /techcrunch\.com/ });
  const feed = await buildFeed(NOW);

  assert.ok(feed.stories.length > 0);
  assert.ok(!feed.stories.some((item) => item.source === "TechCrunch"));
});

test("one source timing out still returns the others", { timeout: 8000 }, async () => {
  mockSources({ hang: /theverge\.com/ });
  const feed = await buildFeed(NOW);

  assert.ok(feed.stories.some((item) => item.source === "TechCrunch"));
  assert.ok(!feed.stories.some((item) => item.source === "The Verge"));
});

test("a feed that returns a block page counts as a failed source", async () => {
  mockSources();
  const mocked = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) =>
    String(input).includes("inc42") ? new Response("<html>Blocked</html>") : mocked(input, init)) as typeof fetch;

  const feed = await buildFeed(NOW);
  assert.ok(feed.stories.length > 0);
  assert.ok(!feed.stories.some((item) => item.source === "Inc42"));
});

test("items older than 36 hours are dropped", () => {
  const fresh = story(1, { publishedAt: new Date(NOW.getTime() - 35 * HOUR).toISOString() });
  const old = story(2, { publishedAt: new Date(NOW.getTime() - 37 * HOUR).toISOString() });

  assert.deepEqual(selectStories([fresh, old], NOW).map((item) => item.id), ["id1"]);
});

test("at most 3 per source and 12 overall", () => {
  const names = ["A", "B", "C", "D", "E", "F"];
  const stories = names.flatMap((source, group) =>
    Array.from({ length: 5 }, (_, index) => story(group * 10 + index, { source })),
  );
  const selected = selectStories(stories, NOW);

  assert.equal(selected.length, MAX_STORIES);
  for (const source of names) {
    assert.ok(selected.filter((item) => item.source === source).length <= MAX_PER_SOURCE);
  }
});

test("duplicates are removed by URL and by title", () => {
  const stories = [
    story(1, { url: "https://www.example.com/same/", title: "First title" }),
    story(2, { url: "https://example.com/same", title: "Second title" }),
    story(3, { url: "https://example.com/other", title: "OpenAI raises $1B!" }),
    story(4, { url: "https://example.com/another", title: "openai raises $1b" }),
    story(5, { url: "https://example.com/unique", title: "Something else" }),
  ];

  assert.deepEqual(dedupe(stories).map((item) => item.id), ["id1", "id3", "id5"]);
});

test("a duplicate keeps the publisher's summary and the Hacker News discussion", async () => {
  mockSources();
  const feed = await buildFeed(NOW);
  const merged = feed.stories.find((item) => item.url.includes("fixture-seed-round"));

  assert.equal(merged?.source, "TechCrunch");
  assert.equal(merged?.publisher, undefined);
  assert.equal(merged?.excerpt, "A short summary written by the publisher.");
  assert.equal(merged?.score, 30);
  assert.equal(merged?.discussionUrl, "https://news.ycombinator.com/item?id=104");
});

test("topic, recency and score all lift a story", () => {
  const plain = story(1);
  const withTopic = story(2, { topics: ["AI" as Topic] });
  const newer = story(3, { publishedAt: NOW.toISOString() });
  const popular = story(4, { score: 500 });

  for (const better of [withTopic, newer, popular]) {
    assert.ok(storyScore(better, NOW) > storyScore(plain, NOW));
  }
});

test("all sources failing throws, so a refresh can't replace the last good list", async () => {
  mockSources({ down: EVERYTHING });
  await assert.rejects(buildFeed(NOW));
});

test("all sources failing returns the last good list with its real time", async () => {
  mockSources({ down: EVERYTHING });
  const lastGood: Feed = {
    updatedAt: new Date(NOW.getTime() - 10 * HOUR).toISOString(),
    stories: [story(1)],
  };

  const feed = await resolveFeed(memoryStore(() => buildFeed(NOW), lastGood), () => buildFeed(NOW), NOW);

  assert.deepEqual(feed, lastGood);
});

test("nothing ever stored returns null, which is the empty state", async () => {
  mockSources({ down: EVERYTHING });

  assert.equal(await resolveFeed(memoryStore(() => buildFeed(NOW)), () => buildFeed(NOW), NOW), null);
});

test("a list up to 4 hours old is served as is", async () => {
  const stored: Feed = {
    updatedAt: new Date(NOW.getTime() - MAX_LIST_AGE_MS + 1000).toISOString(),
    stories: [story(1)],
  };
  let rebuilds = 0;

  const feed = await resolveFeed(
    async () => stored,
    async () => {
      rebuilds += 1;
      return stored;
    },
    NOW,
  );

  assert.equal(feed, stored);
  assert.equal(rebuilds, 0);
});

test("after a quiet spell, a list older than 4 hours is rebuilt before it's shown", async () => {
  mockSources();
  const stored: Feed = {
    updatedAt: new Date(NOW.getTime() - 3 * 24 * HOUR).toISOString(),
    stories: [story(1)],
  };

  const feed = await resolveFeed(async () => stored, () => buildFeed(NOW), NOW);

  assert.equal(feed?.updatedAt, NOW.toISOString());
});

test("a story is found by id, and an unknown id isn't", () => {
  const feed: Feed = { updatedAt: NOW.toISOString(), stories: [story(1)] };

  assert.equal(findStory(feed, "id1")?.id, "id1");
  assert.equal(findStory(feed, "nope"), null);
  assert.equal(findStory(null, "id1"), null);
});
