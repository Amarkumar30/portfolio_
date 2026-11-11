# /future: plan

A private planner at `/future` for upcoming exams, quizzes, interviews and plans. Only the logged-in
admin can see it. The repo is public, so events never go into git: they live in Upstash Redis in
production and in a git-ignored `.data/future.json` locally.

## Privacy

- **Proxy** (`src/proxy.ts`) also matches `/future` and `/api/future/*`. Without a valid session it
  *rewrites* to a path that doesn't exist, so the response is the site's ordinary 404 with the same
  headers as any unknown URL. No redirect to login, nothing that says the page exists. With a session it
  adds `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`.
- **Checked again** in the page (`notFound()` without a session) and in every API handler (404 without a
  session, 403 for a cross-origin write, using the admin's existing `isSameOrigin`).
- **Never cached:** the page is `force-dynamic` and reads cookies; API responses send `private, no-store`.
  `expireTime` in `next.config.ts` only applies to ISR pages, so it doesn't reach these.
- **Not linked publicly:** not in `robots.txt` (listing it would advertise it), sitemap, RSS, `llms.txt`
  or any public page. The only link is a card on the admin dashboard.
- **Writes:** zod validation with size limits (title 120, notes 2,000), a request-size cap, and notes
  rendered as plain text.

## Storage

`@upstash/redis` with a hash `future:events` (`id → JSON`). It reads `KV_REST_API_URL` /
`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Writes are immediate: no
commit, no redeploy. Without Redis, outside production it uses `.data/future.json`; in production it
shows "Storage isn't set up yet — see SETUP_ADMIN.md" to the logged-in admin. Export and import use the
same JSON shape.

## Files added

- `src/features/future/`: `config`, `schema` (zod model), `dates` (IST), `timeline` (grouping,
  sorting, countdowns, stats, filters), `store` (Redis or file), `guard`, components, tests
- `src/app/future/page.tsx`
- `src/app/api/future/events/route.ts`, `events/[id]/route.ts`, `export/route.ts`, `import/route.ts`

## Existing files touched

| File | Why |
| --- | --- |
| `.gitignore` | `.data/`, added before the folder exists |
| `src/proxy.ts` | The 404 for logged-out visitors and the private headers |
| `src/app/admin/page.tsx` | The "Future" card, the only link to the page |
| `package.json`, `package-lock.json` | `@upstash/redis` |
| `.env.example`, `SETUP_ADMIN.md`, `README.md` | Redis setup |

Not touched: `sections.ts` (this isn't git-backed content), `robots.ts`, sitemap, RSS, `llms.txt`,
`next.config.ts`, the footer's Admin link.

## Not built

The optional Month view. The list with type filters and search covers the need, and a calendar grid
is a lot of extra UI to keep accessible on a phone.

## Baseline (before any change)

`npm test` 41 of 41 pass, `npm run lint` clean, `npm run build` passes. Screenshots of `/`, `/about`,
`/blog`, `/tech-today`, `/contact`, 404 and `/admin/login` at 360 and 1280px, light and dark, are in
`screenshots/fu-baseline/` (git-ignored). Locally `/future` was a plain 404 with the same headers as
any unknown URL.
