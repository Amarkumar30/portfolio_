# TODO

Open items for Amar. Kept here instead of inside content files, because editing an entry through the admin rewrites the whole file and would drop comments.

## Files to add

- [ ] `public/resume.pdf` — resume buttons appear automatically once it exists.
- [ ] `public/amar.jpg` — square, at least 480×480. Replaces the "AK" monogram on the home and About pages.

## Bayana (`content/projects/bayana.mdx`)

- [ ] Add screenshots: upload in the admin and set **Screenshot** + its alt text.
- [ ] Update **Status** in the body, and the "Founder · in progress" label, when Bayana launches.
- [ ] Set `date` to when you started (it only affects ordering; `order: 1` keeps Bayana first either way).
- [ ] Add the stack you're building it with, if you want it shown (currently UPI, Razorpay).

## Hostel Management Platform (`content/projects/hostel-management-platform.mdx`)

- [ ] Add GitHub/demo links.
- [ ] Set `date` to when you built it (ordering only).
- [ ] Confirm "The hard part" was the hardest part for you, or replace it.
- [ ] Confirm or replace "What I'd do next".

## FreshSip (`content/projects/freshsip-ordering-platform.mdx`)

- [ ] Add GitHub/demo links.
- [ ] Set `date` to when you built it (ordering only).
- [ ] Confirm "The hard part" was the hardest part for you, or replace it.
- [ ] Confirm or replace "What I'd do next".

## Other content

- [ ] `content/now.mdx` — replace with what you're actually doing this month (editable in the admin under **Now**).
- [ ] `content/research/hinglish-geo-bench.mdx` — update as the method and results firm up.
- [ ] `content/research/indian-brand-visibility-score.mdx` — update as the scoring method firms up.
- [ ] Signal Clear channel URL — add it to `socialLinks` in `src/lib/data.ts` and link it from the About story.

## Setup

- [ ] Follow [SETUP_ADMIN.md](SETUP_ADMIN.md) (GitHub token, password hash, Vercel environment variables).
- [ ] Enable Vercel Web Analytics (fixes a 404 for `/_vercel/insights/script.js`).
