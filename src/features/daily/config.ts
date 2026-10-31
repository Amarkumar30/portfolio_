/**
 * Daily quote & joke — settings.
 * Set DAILY_ENABLED to false to hide the feature everywhere (home card and 404 joke).
 */
export const DAILY_ENABLED = true;

/** The day changes at midnight in this time zone. */
export const DAILY_TIME_ZONE = "Asia/Kolkata";

/** Every external request gives up after this long and falls back to the curated list. */
export const API_TIMEOUT_MS = 3000;

/** Longer API quotes/jokes are replaced by the day's curated pick, to keep the card tidy. */
export const MAX_TEXT_LENGTH = 220;

/** How many extra curated jokes the "Another one" button can show per visit. */
export const MAX_EXTRA_JOKES = 5;

/** Server-side API responses are cached for a day (keyed by the IST date). */
export const API_CACHE_SECONDS = 60 * 60 * 24;

export const ZENQUOTES_TODAY_URL = "https://zenquotes.io/api/today";
export const JOKEAPI_URL =
  "https://v2.jokeapi.dev/joke/Programming?safe-mode&blacklistFlags=nsfw,religious,political,racist,sexist,explicit";
