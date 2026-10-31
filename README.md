# amarkumar.dev

Personal site of Amar Kumar — software engineer, GEO researcher. Live at [www.amarkumar.dev](https://www.amarkumar.dev).

It has a private `/admin` area for publishing to any section. Publishing commits an MDX file to this repository, Vercel redeploys, and the change is live in about 1–2 minutes. There's no database: content is versioned in Git.

## Stack

- Next.js 16 (App Router, `src/proxy.ts`), React 19, TypeScript
- Tailwind CSS v4 with design tokens in `src/app/globals.css` (see [DESIGN_AUDIT.md](DESIGN_AUDIT.md)), `next-themes` for light/dark
- MDX via `@mdx-js/mdx` + `gray-matter`, frontmatter validated with `zod`
- Admin: `jose` (session JWT), `bcryptjs`, `@octokit/rest` (GitHub Contents API), `react-markdown` (editor preview)
- Resend for the contact form, Vercel for hosting and analytics

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in what you need; everything is optional for browsing
npm run dev                  # http://localhost:3000
```

Before pushing:

```bash
npm run lint
npm run build
```

To check the design across screen sizes, run `npm run start`, then `npm run screenshots -- <label>` in another terminal (set `BASE_URL` if the server isn't on port 3000). It saves full-page screenshots of every route at 360, 768, 1280 and 1536px in light and dark to `screenshots/<label>/`, which is git-ignored.

## Content

All content lives in `content/` as MDX files with YAML frontmatter.

| Section  | Files                        | Public route                  |
| -------- | ---------------------------- | ----------------------------- |
| Blog     | `content/blog/<slug>.mdx`     | `/blog`, `/blog/<slug>`         |
| Notes    | `content/notes/<slug>.mdx`    | `/notes` (and "Recent notes" on home) |
| Projects | `content/projects/<slug>.mdx` | `/projects`, `/projects/<slug>` |
| Research | `content/research/<slug>.mdx` | `/research`, `/research/<slug>` |
| Now      | `content/now.mdx`             | home "Now" block, `/now`        |
| Journey  | `content/journey/<slug>.mdx`  | timeline on `/about` (`/about#journey-<slug>`) |

- **One config:** `src/lib/content/sections.ts` defines each section's folder, route, frontmatter schema and admin form fields. To add a section, add an entry there, then add its pages under `src/app/`.
- **Validation:** `src/lib/content/loader.ts` reads files and validates frontmatter. Files with invalid frontmatter are skipped and logged at build time, so they never render as `undefined`.
- **Journey:** each milestone has a date (`YYYY` or `YYYY-MM`, optional until known), a one-line summary, a kind (sets the icon), optional highlight, links and image; the body is the story shown when it's opened. Undated milestones are placed by **Position**; "Now" is always last and uses `content/now.mdx`. Journey entries appear only on the About page (not in the sitemap, RSS or `llms.txt` listings).
- **Drafts:** `draft: true` hides an entry in production. It still shows in `npm run dev`.
- **Uploads:** images uploaded through the admin go to `public/uploads/<yyyy>/<mm>/`.
- **Everything else** (hero, about story, skills, contact copy, social links) is in `src/lib/data.ts`.
- **Optional files:** `public/resume.pdf` and `public/amar.jpg`. Resume buttons and the photo appear only if these exist at build time; otherwise the site shows an "AK" monogram and no resume links.

You can still write content by hand: add an `.mdx` file, commit and push. The admin is a convenience, not a requirement.

Keep notes and to-dos out of content files: the admin rewrites a whole file when you edit an entry, so YAML comments would be lost. Open items live in [TODO.md](TODO.md).

## Daily quote & joke

The home page has a small "Daily" card (a quote and a programming joke), and the 404 page shows the day's joke. It's self-contained in `src/features/daily/` and read-only: it never touches `content/`, the admin or publishing, and isn't in the sitemap, RSS, `llms.txt` or structured data.

- **Sources:** [ZenQuotes](https://zenquotes.io) (quote of the day, with attribution) and [JokeAPI](https://v2.jokeapi.dev) (safe-mode programming jokes, limited to ids reviewed in `curated.ts`). Requests run on the server only, time out after 3 seconds, and are cached per day in IST.
- **Fallback:** if an API fails, is slow, or returns something over 220 characters, the day's pick from the curated list in `src/features/daily/curated.ts` is used.
- **Turn it off:** set `DAILY_ENABLED = false` in `src/features/daily/config.ts`.

## How admin publishing works

```
/admin/login ──► session cookie (signed JWT, httpOnly, 7 days)
/admin/new   ──► PUT /api/admin/content/<section>/<slug>
                   ├─ check session + Origin
                   ├─ validate slug, frontmatter (zod) and MDX
                   └─ commit content/<section>/<slug>.mdx to GITHUB_BRANCH
                                   │
                         Vercel sees the commit, redeploys (~1–2 min)
```

- **Storage:** `src/lib/admin/storage.ts`. With `GITHUB_TOKEN` set, files are committed through the GitHub Contents API as "Amar Kumar <amar.kumar.career@gmail.com>", with messages like `content(blog): publish "Title"`. In development without a token, files are written straight to your working tree, so you can test the admin locally and commit the result yourself.
- **Why Git:** Vercel's filesystem is read-only at runtime, so the admin can't write files on the server.
- **Dashboard:** `/admin` lists every entry from the repository (not from the deployed build), with Edit, Unpublish/Publish (toggles `draft`) and Delete.

### Security

- One admin user. The password is stored only as a bcrypt hash (`ADMIN_PASSWORD_HASH`). The username is compared in constant time, and failed logins always get the same "Invalid credentials" message.
- The session is a signed HS256 JWT (`ADMIN_SESSION_SECRET`) in an `httpOnly`, `sameSite=lax` cookie (also `secure` in production), with a 7-day expiry and a logout route.
- `src/proxy.ts` guards `/admin/*` and `/api/admin/*`. Every admin API handler also re-verifies the session itself.
- All admin writes require a same-origin `Origin` header (CSRF protection).
- Logins are limited to 5 failures per IP per 15 minutes. **Limitation:** the counter lives in memory, so on Vercel it applies per serverless instance and resets on cold starts. Use a shared store such as Upstash Redis if you need a hard limit.
- Slugs must match `[a-z0-9-]`. Writes are only allowed under `content/` and `public/uploads/`. Uploads must be JPG, PNG, WebP or GIF (checked by file signature) and at most 4 MB.
- Admin pages send `noindex`. They're disallowed in `robots.txt` and left out of the sitemap. The footer "Admin" link appears only in a browser that has logged in.

Setup steps are in [SETUP_ADMIN.md](SETUP_ADMIN.md).

## Environment variables

See `.env.example` for the annotated list. Set them in Vercel → Project → Settings → Environment Variables.

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap, RSS, JSON-LD | Defaults to `https://www.amarkumar.dev` |
| `RESEND_API_KEY` | Contact form | Without it, the form tells visitors to email directly |
| `CONTACT_TO_EMAIL` | Contact form | Inbox that receives messages |
| `CONTACT_FROM_EMAIL` | Contact form | Sender on a Resend-verified domain |
| `ADMIN_USERNAME` | Admin | |
| `ADMIN_PASSWORD_HASH` | Admin | From `node scripts/hash-password.mjs "…"` |
| `ADMIN_SESSION_SECRET` | Admin | At least 32 random characters |
| `GITHUB_TOKEN` | Publishing | Fine-grained token, this repository only, Contents: read & write |
| `GITHUB_OWNER` | Publishing | `Amarkumar30` |
| `GITHUB_REPO` | Publishing | `portfolio_` |
| `GITHUB_BRANCH` | Publishing | `main`; commits here trigger the production deploy |

## SEO and GEO

- Canonical URLs, Open Graph and Twitter cards use `NEXT_PUBLIC_SITE_URL`. Posts, projects and research each get their own generated share image.
- JSON-LD: `Person` (home, about), `BlogPosting`, `ScholarlyArticle` (research), and `SoftwareSourceCode` / `CreativeWork` (projects).
- `/sitemap.xml`, `/robots.txt`, `/feed.xml` (RSS for essays and notes), and `/llms.txt`, a plain summary written for LLMs and answer engines.

## Project structure

```
content/                 MDX content (see table above)
public/                  static files; uploads/ is created by the admin
scripts/hash-password.mjs
src/
  app/                   routes (public pages, admin/, api/, feed.xml, llms.txt)
  components/            layout/, sections/, ui/, admin/, mdx/, seo/
  lib/
    content/             sections config + loader
    admin/               auth, session, rate limit, CSRF, paths, storage, content service
    data.ts              site copy
    site.ts              metadata and JSON-LD helpers
  proxy.ts               admin route guard
```
