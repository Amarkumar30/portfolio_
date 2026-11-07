/**
 * The cached list. One fixed key, refreshed every 3 hours: when an entry goes stale Next returns it
 * and rebuilds in the background, and if the rebuild throws the entry stays. That makes it the
 * "last good" copy too. Raise the version when the shape of Feed changes.
 */
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { REFRESH_SECONDS } from "./config";
import { buildFeed, resolveFeed } from "./feed";

const readFeed = unstable_cache(() => buildFeed(), ["tech-today-feed", "v1"], {
  revalidate: REFRESH_SECONDS,
});

/** Per-request, so metadata and the page share one read. */
export const getTechToday = cache(() => resolveFeed(readFeed, buildFeed));
