/**
 * The Daily pick changes at midnight IST: three consecutive IST days give three different
 * quotes and jokes, 23:59 → 00:01 IST flips the day, and the API cache key carries the IST date.
 * Run with: npm test
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getDaily } from "./get-daily";
import type { Joke } from "./types";

let requested: string[] = [];
const realFetch = globalThis.fetch;

beforeEach(() => {
  requested = [];
  // APIs offline: every pick comes from the curated list, so the result depends only on the date.
  globalThis.fetch = (async (url: string | URL) => {
    requested.push(String(url));
    throw new Error("offline");
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const jokeText = (joke: Joke) => (joke.kind === "single" ? joke.text : joke.setup);

async function pick(iso: string) {
  const daily = await getDaily(new Date(iso));
  assert.ok(daily);
  console.log(`${iso.padEnd(26)} → IST ${daily.date} | ${daily.quote.author} | ${jokeText(daily.joke).slice(0, 48)}`);
  return daily;
}

test("three consecutive IST days give three different picks", async () => {
  const days = [
    await pick("2026-11-02T12:00:00+05:30"),
    await pick("2026-11-03T12:00:00+05:30"),
    await pick("2026-11-04T12:00:00+05:30"),
  ];

  assert.deepEqual(days.map((d) => d.date), ["2026-11-02", "2026-11-03", "2026-11-04"]);
  assert.equal(new Set(days.map((d) => d.quote.text)).size, 3);
  assert.equal(new Set(days.map((d) => jokeText(d.joke))).size, 3);
});

test("the day flips at midnight IST (23:59 → 00:01), not midnight UTC", async () => {
  const before = await pick("2026-11-02T23:59:00+05:30"); // 18:29 UTC on the 2nd
  const after = await pick("2026-11-03T00:01:00+05:30"); // 18:31 UTC, still the 2nd in UTC

  assert.equal(before.date, "2026-11-02");
  assert.equal(after.date, "2026-11-03");
  assert.notEqual(before.quote.text, after.quote.text);
  assert.notEqual(jokeText(before.joke), jokeText(after.joke));

  // Same IST day, same pick, whatever the hour.
  const morning = await pick("2026-11-03T00:01:00+05:30");
  const night = await pick("2026-11-03T23:58:00+05:30");
  assert.equal(morning.quote.text, night.quote.text);
});

test("API requests are keyed by the IST date", async () => {
  await getDaily(new Date("2026-11-03T00:01:00+05:30"));
  assert.equal(requested.length, 2);
  for (const url of requested) assert.match(url, /day=2026-11-03/);
});
