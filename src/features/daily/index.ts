/**
 * Daily quote & joke — a self-contained, read-only feature.
 * It never writes files or touches content, the admin, or publishing, and it isn't included in
 * the sitemap, RSS, llms.txt or structured data. Turn it off with DAILY_ENABLED in ./config.ts.
 */
export { DailyCard, DailyJoke } from "./daily-card";
