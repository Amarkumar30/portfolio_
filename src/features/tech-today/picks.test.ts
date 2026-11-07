/**
 * "Amar's pick" selection and the page shown for a story that has left the list.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RotatedOut } from "./components/reading-page";
import { sectionSchemas } from "@/lib/content/sections";
import { latestPick } from "./picks";
import type { TechPick } from "./types";

const NOW = new Date("2026-11-07T06:00:00Z");

function pick(slug: string, date: string, draft = false): TechPick {
  return { slug, date, draft, title: slug, url: "https://example.com/a", source: "Example", note: "My take." };
}

test("the newest published pick from the last 7 days is pinned", () => {
  const picks = [pick("older", "2026-11-02"), pick("newest", "2026-11-06"), pick("old", "2026-10-01")];
  assert.equal(latestPick(picks, NOW)?.slug, "newest");
});

test("a draft is never pinned", () => {
  const picks = [pick("draft", "2026-11-07", true), pick("published", "2026-11-05")];
  assert.equal(latestPick(picks, NOW)?.slug, "published");
});

test("no recent pick pins nothing", () => {
  assert.equal(latestPick([pick("seven", "2026-10-31")], NOW)?.slug, "seven");
  assert.equal(latestPick([pick("eight", "2026-10-30")], NOW), null);
  assert.equal(latestPick([], NOW), null);
});

test("the pick's day is counted in IST", () => {
  // 20:00 UTC on the 7th is already the 8th in IST, so the 1st is 7 days back and the 31st is 8.
  const lateUtc = new Date("2026-11-07T20:00:00Z");
  assert.equal(latestPick([pick("first", "2026-11-01")], lateUtc)?.slug, "first");
  assert.equal(latestPick([pick("october", "2026-10-31")], lateUtc), null);
});

test("a pick must have a note and a web link", () => {
  const valid = { title: "T", url: "https://example.com", source: "S", date: "2026-11-07", note: "N" };
  const schema = sectionSchemas["tech-picks"];

  assert.ok(schema.safeParse(valid).success);
  assert.ok(!schema.safeParse({ ...valid, note: "" }).success);
  assert.ok(!schema.safeParse({ ...valid, url: "javascript:alert(1)" }).success);
});

test("an unknown id renders the rotated-out page with a way back", () => {
  const html = renderToStaticMarkup(createElement(RotatedOut));

  assert.match(html, /This story has rotated out of today(&#x27;|')s list\./);
  assert.match(html, /href="\/tech-today"/);
});
