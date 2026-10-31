export type DailySource = "zenquotes" | "jokeapi" | "curated";

export interface Quote {
  text: string;
  author: string;
  source: DailySource;
}

export type Joke =
  | { kind: "single"; text: string; source: DailySource }
  | { kind: "twopart"; setup: string; punchline: string; source: DailySource };

export type CuratedQuote = Omit<Quote, "source">;
export type CuratedJoke =
  | { kind: "single"; text: string }
  | { kind: "twopart"; setup: string; punchline: string };

export interface Daily {
  /** Calendar day in IST, YYYY-MM-DD. */
  date: string;
  quote: Quote;
  joke: Joke;
  /** Curated jokes for the "Another one" button (client-side only, no API calls). */
  moreJokes: Joke[];
}
