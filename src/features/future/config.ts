/**
 * Private planner (/future) — settings. Safe to import from client components.
 * Events are never stored in the repo: Redis in production, a git-ignored file locally.
 */
export const FUTURE_PATH = "/future";

/** Redis hash holding every event as id → JSON. */
export const REDIS_KEY = "future:events";

/** Local development store, inside the git-ignored .data/ folder. */
export const LOCAL_DATA_FILE = ".data/future.json";

export const LIMITS = {
  title: 120,
  notes: 2000,
  course: 80,
  location: 120,
  link: 2000,
  prepItems: 30,
  prepText: 200,
  /** Largest request body for one event, and for an import. */
  eventBytes: 16_000,
  importBytes: 2_000_000,
  importEvents: 2000,
} as const;

/** Headers on every /future response: never cached anywhere, never indexed. */
export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;
