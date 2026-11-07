/**
 * Every source's response shape, from fixtures (no network), and the cleaning that follows.
 * Fixtures are hand-written to match real responses checked on 2026-11-07.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { SOURCES } from "./config";
import { normaliseStory } from "./normalise";
import { parseDevTo, parseFeedXml, parseHnItem } from "./parse";
import { canonicalUrl, plainText, toExcerpt, urlKey } from "./sanitize";
import type { RawStory } from "./types";

const fixture = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), "src/features/tech-today/__fixtures__", name), "utf8");

const source = (name: string) => {
  const found = SOURCES.find((item) => item.name === name);
  assert.ok(found);
  return found;
};

const raw = (overrides: Partial<RawStory>): RawStory => ({
  title: "A fixture story",
  url: "https://example.com/story",
  publishedAt: "2026-11-07T00:00:00.000Z",
  ...overrides,
});

test("RSS with CDATA (TechCrunch)", () => {
  const [first] = parseFeedXml(fixture("techcrunch.xml"));

  assert.equal(first.title, "Fixture startup raises a $10M seed round for AI tooling");
  assert.equal(first.author, "Ada Fixture");
  assert.equal(first.publishedAt, "2026-11-07T03:00:00.000Z");
  assert.deepEqual(first.tags, ["Venture", "AI"]);
  assert.equal(first.excerpt, "A short summary written by the publisher.");
});

test("RSS with a featured image and boilerplate in the description (Inc42)", () => {
  const story = normaliseStory(parseFeedXml(fixture("inc42.xml"))[0], source("Inc42"));

  assert.equal(story?.title, "Indian Fintech Fixture Raises ₹100 Cr & Expands");
  assert.equal(story?.excerpt, "The summary comes after a featured image.");
  assert.ok(story?.topics.includes("India"));
});

test("Atom with alternate and replies links (The Verge)", () => {
  const [first, second] = parseFeedXml(fixture("verge.xml"));

  assert.equal(first.url, "https://www.theverge.com/security/1/fixture-flaw");
  assert.equal(first.author, "Sam Fixture");
  assert.equal(first.publishedAt, "2026-11-07T02:00:00.000Z");
  assert.deepEqual(first.tags, ["Security", "News"]);
  assert.equal(first.excerpt, "The publisher's own short summary.");
  assert.deepEqual(second.tags, ["Entertainment"]);
});

test("the full article is never read", () => {
  const parsed = ["inc42.xml", "yourstory.xml", "verge.xml"].flatMap((name) => parseFeedXml(fixture(name)));

  assert.ok(parsed.length >= 3);
  assert.ok(!JSON.stringify(parsed).includes("FULL ARTICLE TEXT"));
});

test("dev.to", () => {
  const [first] = parseDevTo(JSON.parse(fixture("devto.json")));

  assert.equal(first.title, "Building a TypeScript fixture");
  assert.equal(first.author, "Dev Fixture");
  assert.deepEqual(first.tags, ["typescript", "webdev"]);
  assert.throws(() => parseDevTo({ error: "nope" }));
});

test("Hacker News keeps only stories with a link", () => {
  const items = JSON.parse(fixture("hn-items.json"));
  const story = parseHnItem(items["101"]);

  assert.equal(story?.score, 420);
  assert.equal(story?.discussionUrl, "https://news.ycombinator.com/item?id=101");
  assert.equal(parseHnItem(items["102"]), null);
  assert.equal(parseHnItem(items["103"]), null);
});

test("a Hacker News story credits the article's site as its publisher", () => {
  const story = normaliseStory(raw({ url: "https://www.example.com/a" }), source("Hacker News"));

  assert.equal(story?.source, "Hacker News");
  assert.equal(story?.publisher, "example.com");
});

test("a page that isn't a feed throws, so the source counts as failed", () => {
  assert.throws(() => parseFeedXml("<html><body>Blocked</body></html>"));
});

test("HTML and scripts are stripped from titles and excerpts", () => {
  const cases: [string, string][] = [
    ["<script>alert(1)</script>Hello", "Hello"],
    ["Hello<script>alert(1)", "Hello"],
    ['<img src=x onerror="alert(1)">Hello', "Hello"],
    ["Hello <img src=x onerror=alert(1)", "Hello"],
    ["&lt;script&gt;alert(1)&lt;/script&gt;Hello", "Hello"],
    ["&amp;lt;img src=x onerror=alert(1)&amp;gt;Hello", "Hello"],
    ["<style>p{color:red}</style><b>Bold</b> text", "Bold text"],
    ["<!-- hidden -->Hello", "Hello"],
    ["Fish &amp; chips &#8212; &#x2019;tis", "Fish & chips — ’tis"],
    ["  lots \n of \t space  ", "lots of space"],
    ["2 < 3 and 5 > 4", "2 < 3 and 5 > 4"],
  ];

  for (const [input, expected] of cases) assert.equal(plainText(input), expected);
});

test("a hostile story comes out clean", () => {
  const story = normaliseStory(
    raw({
      title: '<script>steal()</script>Real title<img src=x onerror="steal()">',
      excerpt: '<a href="javascript:steal()" onclick="steal()">Real</a> summary',
    }),
    source("TechCrunch"),
  );

  assert.equal(story?.title, "Real title");
  assert.equal(story?.excerpt, "Real summary");
});

test("excerpts are cut near 600 characters at a boundary", () => {
  const sentences = "This is one sentence of a summary. ".repeat(40);
  const words = "word ".repeat(200);

  for (const text of [toExcerpt(sentences), toExcerpt(words)]) {
    assert.ok(text.length <= 601, `length ${text.length}`);
    assert.ok(text.endsWith("…"));
  }
  assert.ok(toExcerpt(sentences).endsWith("summary…"));
  assert.ok(toExcerpt(words).endsWith("word…"));
  assert.equal(toExcerpt("Short and sweet."), "Short and sweet.");
});

test("javascript: and non-http URLs are rejected", () => {
  const unsafe = [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java&#115;cript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://example.com/a",
    "not a url",
    "",
  ];

  for (const url of unsafe) {
    assert.equal(canonicalUrl(url), null, url);
    assert.equal(normaliseStory(raw({ url }), source("TechCrunch")), null, url);
  }
});

test("tracking parameters are removed and real ones kept", () => {
  assert.equal(
    canonicalUrl("https://example.com/a?utm_source=x&id=7&utm_campaign=y&fbclid=1&gclid=2&ref=hn#top"),
    "https://example.com/a?id=7",
  );
  assert.equal(canonicalUrl("https://user:pass@example.com/a"), "https://example.com/a");
  assert.equal(canonicalUrl("https://example.com/a?utm_source=x&amp;id=7"), "https://example.com/a?id=7");
});

test("the same page matches however it's spelled", () => {
  assert.equal(urlKey("https://www.example.com/a/"), urlKey("http://example.com/a"));
  assert.notEqual(urlKey("https://example.com/a"), urlKey("https://example.com/b"));
});

test("stories with no title or no date are dropped, and deals and paid posts", () => {
  const techcrunch = source("TechCrunch");

  assert.equal(normaliseStory(raw({ title: "<b></b>" }), techcrunch), null);
  assert.equal(normaliseStory(raw({ publishedAt: "" }), techcrunch), null);
  assert.equal(normaliseStory(raw({ title: "Best deals on headphones" }), techcrunch), null);
  assert.equal(normaliseStory(raw({ tags: ["Sponsored"] }), techcrunch), null);
  assert.ok(normaliseStory(raw({ title: "OpenAI signs a $1B deal" }), techcrunch));
});

test("a summary is optional", () => {
  const story = normaliseStory(raw({ excerpt: undefined }), source("TechCrunch"));
  assert.equal(story?.excerpt, "");
});
