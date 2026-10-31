# TODO

Open items for Amar. Kept here instead of inside content files, because editing an entry through the admin rewrites the whole file and would drop comments.

## Files to add

- [ ] `public/resume.pdf` — resume buttons appear automatically once it exists.
- [ ] `public/amar.jpg` — square, at least 480×480. Replaces the "AK" monogram on the home and About pages.

## Bayana (`content/projects/bayana.mdx`)

- [ ] Add screenshots: upload in the admin and set **Screenshot** + its alt text.
- [ ] Update **Status** in the body, and the "Founder · in progress" label, when Bayana launches.
- [ ] Set `date` to when you started (it only affects ordering; `order: 1` keeps Bayana first either way). **Year** is set to 2026.
- [ ] Add the stack you're building it with, if you want it shown (currently UPI, Razorpay).

## Hostel Management Platform (`content/projects/hostel-management-platform.mdx`)

- [ ] Set **Year** (shown in the case study details; hidden until set).
- [ ] Add GitHub/demo links.
- [ ] Set `date` to when you built it (ordering only).
- [ ] Confirm "The hard part" was the hardest part for you, or replace it.
- [ ] Confirm or replace "What I'd do next".

## FreshSip (`content/projects/freshsip-ordering-platform.mdx`)

- [ ] Set **Year** (shown in the case study details; hidden until set).
- [ ] Add GitHub/demo links.
- [ ] Set `date` to when you built it (ordering only).
- [ ] Confirm "The hard part" was the hardest part for you, or replace it.
- [ ] Confirm or replace "What I'd do next".

## Journey (`content/journey/`, shown on /about)

Edit these in the admin under **Journey**. Dates are `YYYY` or `YYYY-MM`; a milestone without a date shows no date label and is placed by its **Position**.

- [ ] **Joined South Asian University** — add the month you started, if you want it shown (currently `2024`).
- [ ] **1st Prize, AvishkarX** — add the date, and replace the placeholder story ("The story behind this one is coming soon.") with what the idea was and what you built.
- [ ] **SmartHack — Hostel Management Platform** — add the date (year or month). The story is taken from the case study; adjust it if you like.
- [ ] **Built FreshSip, solo** — add the date. The story is taken from the case study.
- [ ] **Research Intern — GEO at SAU** — add the date you started. The story is taken from the About page.
- [ ] **Started Signal Clear** — add the date, and a link to the channel once you have the URL (see below).
- [ ] **Founded Bayana** — add the month, if you want it shown (currently `2026`).
- [ ] **Now** — nothing to do: its summary and story come from `content/now.mdx` (the **Now** entry in the admin).

## Other content

- [ ] `content/now.mdx` — replace with what you're actually doing this month (editable in the admin under **Now**).
- [ ] `content/research/hinglish-geo-bench.mdx` — update as the method and results firm up.
- [ ] `content/research/indian-brand-visibility-score.mdx` — update as the scoring method firms up.
- [ ] Signal Clear channel URL — add it to `socialLinks` in `src/lib/data.ts` and link it from the About story.

## Setup

- [ ] Follow [SETUP_ADMIN.md](SETUP_ADMIN.md) (GitHub token, password hash, Vercel environment variables).
- [ ] Enable Vercel Web Analytics (fixes a 404 for `/_vercel/insights/script.js`).
