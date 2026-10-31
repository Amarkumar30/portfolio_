/**
 * getDaily: today's quote and joke (server-side).
 * API results are used when they arrive in time and fit the card; otherwise the day's curated
 * pick is used. Returns null when the feature is off, and never throws.
 */
import { DAILY_ENABLED, MAX_EXTRA_JOKES, MAX_TEXT_LENGTH } from "./config";
import { curatedJokes, curatedQuotes } from "./curated";
import { dayNumber, pickForDay, todayInIst } from "./date";
import { fetchJoke, fetchQuote } from "./sources";
import type { CuratedJoke, Daily, Joke, Quote } from "./types";

function quoteFits(quote: Quote) {
  return quote.text.length <= MAX_TEXT_LENGTH;
}

function jokeFits(joke: Joke) {
  const length = joke.kind === "single" ? joke.text.length : joke.setup.length + joke.punchline.length;
  return length <= MAX_TEXT_LENGTH;
}

function curatedJoke(joke: CuratedJoke): Joke {
  return { ...joke, source: "curated" };
}

export async function getDaily(): Promise<Daily | null> {
  if (!DAILY_ENABLED) return null;

  try {
    const date = todayInIst();
    const day = dayNumber(date);
    const [apiQuote, apiJoke] = await Promise.all([fetchQuote(date), fetchJoke(date)]);

    const quote: Quote =
      apiQuote && quoteFits(apiQuote) ? apiQuote : { ...pickForDay(curatedQuotes, day), source: "curated" };
    const joke: Joke =
      apiJoke && jokeFits(apiJoke) ? apiJoke : curatedJoke(pickForDay(curatedJokes, day));

    // "Another one" continues through the curated list after today's curated pick.
    const start = joke.source === "curated" ? 1 : 0;
    const moreJokes = Array.from({ length: MAX_EXTRA_JOKES }, (_, index) =>
      curatedJoke(pickForDay(curatedJokes, day, start + index)),
    );

    return { date, quote, joke, moreJokes };
  } catch (error) {
    console.error("[daily] falling back to nothing", error);
    return null;
  }
}
