# Tech Today: plan

A "Tech Today" tab under Writing with the day's top tech headlines from public feeds, a reading
page on this site (headline, publisher's own summary, link out), and an optional "Amar's pick"
pinned from the admin. It follows the Daily feature's shape: one isolated folder, server-only
fetching, a timeout on every source, a feature flag.

## Decisions

- **Route: `/tech-today` and `/tech-today/[id]`.** The existing tabs are top-level (`/blog`,
  `/notes`), and there is no `/writing`.
- **Sources** (each checked with a real request first): Hacker News API, dev.to API, TechCrunch
  RSS, The Verge (Atom, not RSS), Inc42 RSS, YourStory RSS (`https://yourstory.com/feed`).
- **Only publishers' summaries.** `<description>` / `<summary>` only. `content:encoded` and Atom
  `<content>` hold the full article and are never read.
- **Hacker News items need a publisher.** HN links to other sites, so "Read the full article on
  Hacker News" would be wrong. Items get an optional `publisher` (the article's domain) that the
  button uses; the meta row still credits Hacker News.
- **Parser:** `fast-xml-parser`, with entity processing off (we decode text ourselves).

## Caching

- `?topic=` needs `searchParams`, so the list is a dynamic route, like `/blog`. The cached thing is
  the data, not the page.
- The list is cached with `unstable_cache` under one fixed key, refreshed every 3 hours. On a stale
  entry Next returns it and refreshes in the background; if that refresh throws, the entry stays.
  That is the "last good" copy, with no new storage.
- The Daily bug applies here too: a stale entry can be any age after a quiet spell. So anything
  older than 4 hours triggers a foreground rebuild; if that fails the visitor gets the last good
  list with its real "Updated" time.
- **`next.config.ts` is not touched.** There are no per-route rules in it to add to: `expireTime`
  is one global value that only applies to ISR pages, and raising it would change `/` and
  `/api/daily`. The list isn't ISR, so it doesn't need a rule.

## Files added

- `src/features/tech-today/`: `config`, `types`, `sanitize`, `parse`, `sources`, `rank`, `feed`,
  `cache`, `picks`, `format`, components, tests and `__fixtures__/`
- `src/app/tech-today/page.tsx`, `src/app/tech-today/[id]/page.tsx`: thin routes
- `content/tech-picks/`: created by the admin on the first pick

## Existing files touched

| File | Why |
| --- | --- |
| `src/components/sections/writing-tabs.tsx` | The new tab, hidden when the flag is off |
| `src/components/layout/site-header.tsx` | Keep "Writing" active on `/tech-today` |
| `src/lib/content/sections.ts` | Register `tech-picks`; the admin picks it up from here |
| `src/app/llms.txt/route.ts` | The one allowed line, hidden when the flag is off |
| `package.json`, `package-lock.json` | `fast-xml-parser` |
| `README.md`, `.env.example` (if needed) | Document the feature |

Sitemap, RSS, JSON-LD, home page, Daily and journey are not touched. They list their content
explicitly, so nothing leaks in.

## Baseline (before any change)

`npm test` 3 of 3 pass, `npm run lint` clean, `npm run build` passes. Screenshots of `/`, `/about`,
`/blog`, `/notes`, a post, `/contact` and 404 at 360 and 1280px, light and dark, are in
`screenshots/baseline/` (git-ignored). There is no contact API test in the repo yet.
