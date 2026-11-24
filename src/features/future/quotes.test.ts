/**
 * The daily quote: enough of them, all credited, one per IST day, no repeats within a cycle.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, istDate } from "./dates";
import { QUOTES, THEMES, quoteFor, quoteIndex } from "./quotes";

const ist = (local: string) => Date.parse(`${local}+05:30`);

test("at least 150 quotes, every one with text, an author and a theme", () => {
  assert.ok(QUOTES.length >= 150, `only ${QUOTES.length}`);
  for (const quote of QUOTES) {
    assert.ok(quote.text.trim().length > 5, quote.text);
    assert.ok(quote.author.trim(), quote.text);
    assert.ok(THEMES.includes(quote.theme), quote.text);
  }
});

test("no duplicate quotes", () => {
  assert.equal(new Set(QUOTES.map((quote) => quote.text.toLowerCase())).size, QUOTES.length);
});

test("every theme is well represented", () => {
  for (const theme of THEMES) {
    assert.ok(QUOTES.filter((quote) => quote.theme === theme).length >= 40, theme);
  }
});

test("the same quote all day; a new one at midnight IST, not UTC", () => {
  const morning = quoteFor(istDate(ist("2026-11-24T00:01:00")));
  const night = quoteFor(istDate(ist("2026-11-24T23:59:00")));
  const nextDay = quoteFor(istDate(ist("2026-11-25T00:01:00"))); // still the 24th in UTC

  assert.equal(morning, night);
  assert.notEqual(night, nextDay);
});

test("nothing repeats until the whole list has been shown, then it starts again", () => {
  const start = "2026-11-24";
  const seen = new Set(Array.from({ length: QUOTES.length }, (_, day) => quoteIndex(addDays(start, day))));

  assert.equal(seen.size, QUOTES.length);
  assert.equal(quoteFor(addDays(start, QUOTES.length)), quoteFor(start));
});

test("themes rotate day by day", () => {
  const themes = Array.from({ length: 30 }, (_, day) => quoteFor(addDays("2026-11-24", day)).theme);
  const repeats = themes.filter((theme, index) => index > 0 && theme === themes[index - 1]).length;
  assert.equal(repeats, 0);
});

test("Another steps to a different quote without changing the day's", () => {
  assert.notEqual(quoteFor("2026-11-24", 1), quoteFor("2026-11-24"));
  assert.equal(quoteFor("2026-11-24"), quoteFor("2026-11-24", 0));
});
