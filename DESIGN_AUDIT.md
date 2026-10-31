# Design audit

How this was done: `scripts/screenshots.mjs` captured every public route plus `/admin/login` at 360, 768, 1280 and 1536px, in light and dark (128 full-page screenshots). Each was reviewed by eye. Screenshots are written to `screenshots/` and are not committed.

```bash
npm run build && npm run start         # terminal 1
node scripts/screenshots.mjs before    # terminal 2 → screenshots/before/
```

## Before

### Site-wide

- **Background:** a radial teal wash behind the header. It's decorative and makes the top of every page a slightly different colour from the rest.
- **Dark mode is green-tinted:** background `#0c1412`, surfaces `#121d1a`, muted text `#a3b6af`. It reads as "themed", not neutral.
- **The accent does too much.** Teal is used for:
  - every eyebrow label
  - list markers
  - "Read case study" lines
  - every inline arrow link
  - the hero status line

  With that much teal, it no longer marks what's clickable or important.
- **Cascade bug:** the global `* { border-color }` rule sat outside any layer, so it beat Tailwind utilities. Accent-coloured borders silently rendered grey, for example:
  - the active **Essays/Notes** tab underline
  - "hover:border-accent"

  The inactive tab also showed an underline it shouldn't have.
- **Two display families:**
  - Sora headings over Inter body. Sora is wide and geometric, so large headings felt heavy next to Inter's narrower body text.
  - Sora's `ss`-style "a"/"g" clash with Inter's.
  - There was no mono face for metadata or code.
- **No fixed type scale:**
  - Headings mix `text-4xl sm:text-5xl`, `sm:text-6xl` and `text-2xl sm:text-3xl`.
  - Body text switches between 16, 17 and 18px depending on the page.
  - Card summaries are 16px with 28px line height, while page descriptions are 18px with 32px line height.
- **Spacing:**
  - Section gaps vary: 96 and 112px on home, 80px on About, 48px on Projects.
  - Pages start at different heights below the header: 48px on mobile and 80px on desktop, but blog posts add a back link first.
- **Radii:** buttons are pills (`rounded-full`), cards 16px, fields 8px, tags pills, Callout 24px. Four radii with no system behind them.
- **Card shadows:** a soft two-layer shadow plus a border. Light mode looks slightly "floaty"; dark mode has no shadow, so the two themes feel like different designs.
- **Buttons:** the same "primary" style is hand-written in four places:
  - `ButtonLink`
  - the contact form
  - the admin bar
  - the login form

  Heights differ (about 38–42px), and none reach 44px on touch screens.
- **Header:**
  - The bottom hairline is always on, even at the top of the page.
  - The mobile menu is an inline list that pushes the page down, with no body scroll lock, no Escape key and no focus handling.
  - Nav links are 36px tall.
- **Footer:**
  - Two stacked rows on the right (links, then ©), which don't line up with the one-line text on the left.
  - Links are 20px tall: too small to tap.
  - No RSS link.
- **Width and alignment:** the container is `max-w-5xl`, 1024px including gutters. At 1536px that leaves a lot of empty side space.
  - Gutters jump from 16px to 32px at 640px, so tablets get the desktop gutter.
  - Reading pages (blog, research) centre a 68ch column, but case studies and Notes left-align theirs. Two reading layouts.

### Home

- **Hero:**
  - Three equal-weight pill buttons wrap onto two rows at 360px, with "Get in touch" alone on the second row.
  - The status line is a teal eyebrow, not a status.
  - On desktop the monogram floats at the top right, aligned to nothing.
  - On mobile the monogram sits *above* the status line, pushing the name down.
- **What I'm building toward:**
  - The columns have very different lengths (Research is about twice as long as Engineering).
  - Links sit at different heights.
  - The closing line is in the heading font at 18px, so it looks like an orphaned heading rather than a closing thought.
- **Now:**
  - Uses a teal left border.
  - "Updated October 2026" is right-aligned on desktop but floats under the title on mobile.
  - It sits between "Building toward" and "Selected work", which breaks the flow.
- **Selected work:**
  - Cards have uneven internal rhythm. The Hostel card has no eyebrow, so its title sits higher than Bayana's.
  - Stack tags are plain text with no visual container.
  - The "Read case study" link is teal in every card.
- **Recent writing:** one post rendered as a large card in a two-column grid leaves half the row empty.
- **Recent notes:** a different list style from writing (date right-aligned, no reading time).
- **Final CTA:** a third full-width text block with its own heading weight. The page ends on three similar paragraphs (closing line, Now, CTA).

### About

- The page heading reads well, but the sidebar's teal eyebrows (EDUCATION / RECOGNITION / RESEARCH) compete with the story.
- The sidebar doesn't include Links (GitHub, LinkedIn, Email).
- On mobile the sidebar stacks *after* the whole story, so education comes last.
- **Skills:** the grid of seven blocks leaves "Familiar with" alone on its own row at 1280px.

### Projects (list and case study)

- **List:** cards in a row have equal heights, but at 768px Hostel's stack wraps to two lines while Bayana's doesn't, so the CTA lines don't align.
- **Case study:**
  - There's no meta row: role is the first body section, while stack and links live in a sidebar.
  - On mobile, stack and links drop to the very bottom, after "What I'd do next".
  - Stack chips are pills, unlike tags anywhere else.
  - The heading (h1 48px) jumps straight to h2 at 28px, with no rhythm between header and body.

### Writing (blog index, post, notes)

- **Index:** a single post is shown as a half-width card. The Essays/Notes tabs show the cascade bug (both underlined, active one grey).
- **Post:**
  - Good measure, but no table of contents on a post with four sections.
  - No reading progress, no previous/next and no "Back to writing" at the end: the post just stops before the footer.
  - The meta line (date · reading time) is plain body text.
- **Notes:**
  - The note date is 14px sans directly above the 24px title, with no gap between them.
  - The left-aligned 68ch column leaves the right half empty at 1280px+.

### Research

- The index description is four lines at 1536px and has an orphaned last line ("ask.").
- Cards are fine, but "IN PROGRESS" teal eyebrows on every card add noise.

### Now

- Fine structurally. The eyebrow carries the update date in teal caps, which is hard to read as a date.

### Contact

- **Form card:**
  - It stretches to the full height of the left column, leaving a large empty area under the button at 1280px.
  - The "Name / Email" labels are bold, while page body text is regular, which looks inconsistent.
  - Validation only runs on submit.
  - There's no `aria-describedby` linking errors to fields.
- **Direct links:** the 80px label column (`w-20`) cramps "LinkedIn" and the long LinkedIn URL on small screens.
- **Topics list:** uses teal em dashes as bullets.

### 404

- Four equal buttons. A short message and one clear way home would be calmer.

### Admin login

- It's a plain heading over text, with no card, no show/hide password toggle and no autofocus.
- On a deployment without credentials, the configuration message is unstyled body text.

### Contrast (before)

All primary pairs passed AA. The weakest was muted text in dark mode on surface (`#a3b6af` on `#121d1a`), at about 8:1. Contrast wasn't the problem; the hierarchy was.

## Decisions

- **Typography:**
  - **Inter for headings and body, JetBrains Mono for metadata and code.**
    - Inter at weight 600 with negative tracking (-0.022 to -0.035em, depending on size) gives crisp, calm headings.
    - Using one sans family removes the Sora/Inter mismatch and saves a font download.
    - The mono face carries dates, tags and labels, which gives the "precise" feel without a second display face.
  - Weights shipped: Inter 400/500/600, JetBrains Mono 400/500.
- **Type scale** (tokens in `globals.css`, used as `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-caption`):

  | Token | Size | Line height | Tracking |
  | --- | --- | --- | --- |
  | display | 44–56px (fluid) | 1.08 | -0.035em |
  | h1 | 36–44px (fluid) | 1.12 | -0.03em |
  | h2 | 26–30px (fluid) | 1.2 | -0.022em |
  | h3 | 20px | 1.35 | -0.012em |
  | lead | 19px | 1.6 | |
  | body | 17px | 1.7 (prose 1.75) | |
  | small | 14px | 1.55 | |
  | caption | 13px | 1.5 | |

- **Layout:**
  - One container: 1120px of content plus gutters (16 / 24 / 32px).
  - Sections are 64px apart on mobile and 96px from 640px up.
  - Reading pages use a 680px column.
- **Colour:**
  - Neutral greys with no tint in either theme.
  - Teal is reserved for links, focus rings and the primary button.
  - Eyebrows and metadata use the neutral "subtle" grey.
- **Radius:** 8px for controls and 12px for cards. Tags are 6px, and filter chips are the only pill shape (they are toggles, not buttons).
- **Shadows:** none. Hairline borders only; hover darkens the border and lifts the card by 2px.

## Contrast (after)

Computed from the tokens in `src/app/globals.css` (WCAG 2.1; AA needs 4.5 for normal text):

| Text | Light (on bg / surface / muted surface) | Dark (on bg / surface / muted surface) |
| --- | --- | --- |
| foreground | 17.18 / 17.93 / 16.30 | 16.91 / 15.87 / 14.87 |
| muted | 7.49 / 7.81 / 7.10 | 7.85 / 7.37 / 6.90 |
| subtle (labels, meta) | 5.50 / 5.74 / 5.22 | 6.12 / 5.75 / 5.38 |
| accent (links) | 5.24 / 5.47 / 4.98 | 10.64 / 9.98 / 9.35 |
| danger (errors) | 6.20 / 6.47 / 5.88 | 7.16 / 6.72 / 6.29 |
| primary button text on accent | 5.47 (hover 7.58) | 7.77 (hover 9.78) |

Every pair passes AA. Dark text is `#ededed`, not pure white.

## After

Re-captured with `node scripts/screenshots.mjs after` (same 16 routes × 4 widths × 2 themes) and reviewed side by side with `before/`.

### Site-wide

- **Background:** no gradient. The page background is flat near-white (`#fafafa`) or near-black (`#0a0a0a`).
- **Dark mode:** neutral greys, not green-tinted. Cards sit on a slightly raised `#131313` surface, and body text is `#ededed`.
- **Accent:** teal now appears only in these places:
  - links in prose
  - focus rings
  - the primary button
  - the status dot
  - the active table-of-contents entry
  - the reading-progress bar

  Labels and metadata use neutral grey mono text.
- **Cascade bug:** fixed. Base styles are in `@layer base` and component classes in `@layer components`, so utilities win as they should.
- **`tailwind-merge`:** it now knows the custom type scale. Before, `cn("text-small text-muted")` silently dropped the size.
- **Alignment:** every page's left edge lines up with "Amar Kumar" in the header, at every width. The container is 1120px of content with 16/24/32px gutters.
  - Reading pages (posts, research, case studies) centre a 680px column.
  - Their table of contents sits in the right margin from 1280px.
- **Header:**
  - Transparent with no hairline at the top of the page; once you scroll it becomes translucent with a hairline.
  - Active link: foreground text with a thin underline.
  - Mobile: full-height sheet with 56px rows that closes on Escape and on navigation, locks page scroll, and keeps focus inside the header.
- **Footer:** one row (line about me, then GitHub, LinkedIn, Email, RSS, then ©), aligned to the container. Links are 44px tall on touch screens.
- **Buttons:** one height everywhere (40px, or 44px on touch screens), 8px radius, the same 14px/500 text, and 16px icons.

### Page by page

- **Home:**
  - The hero is a 56px monogram next to the status line, then the name (display size), the positioning line, two short paragraphs and two buttons. It fits above the fold at 1280×800.
  - "What I'm building toward": three equal-height cards with matching 36px icon tiles. The Bayana link sits at the bottom of its card.
  - "Selected work": cards with a label, title, summary, up to five mono tags and "+N". The whole card is clickable; hover darkens the border and lifts it 2px.
  - "Latest writing" and "Recent notes" are side by side on desktop as simple rows (date, title, reading time). This removes the half-empty card grid.
  - "Now" is a compact card with "Updated October 2026" in mono.
- **About:** the story is in the reading column, with a sticky sidebar for Education, Focus, Recognition and Links. On mobile the sidebar becomes a two-column grid after the story. Skills are a single definition list, so "Familiar with" no longer sits alone on its own row.
- **Projects:** every card has a label, using "Case study" when the project has no status, so titles line up across a row.
- **Case studies:**
  - New meta row: Role, Stack (mono tags) and Links, now at the *top* on mobile instead of after the last section.
  - Optional 16:9 bordered cover.
  - Table of contents, plus previous/next and "Back to projects" at the end.
- **Writing:**
  - The index is a list of rows with excerpts.
  - Tag chips are quiet, and the active one is filled.
  - Essays/Notes tabs have a 1px foreground underline.
- **Posts and research:**
  - Thin reading-progress bar.
  - Sticky table of contents (for three or more sections) that highlights the current section.
  - Meta row: date, reading time and tag links.
  - Previous/next and "Back to …" at the end.
- **Prose:**
  - 17px with 1.75 line height.
  - h2/h3 spacing, with scroll margin clearing the sticky header.
  - Quiet blockquotes and markers.
  - Tables scroll inside a bordered wrapper.
  - Images span the full column with optional captions (`![alt](src "Caption")`).
  - Code blocks have a filename label (```` ```ts title="file.ts" ````), a copy button, no line wrapping, and the same surface in both themes.
- **Notes:** dates in mono above each title, with dividers between notes.
- **Contact:**
  - Intro, topics and direct links on the left; the form on the right. The form card no longer stretches to the column height.
  - Labels sit above inputs.
  - Fields are validated when you leave them, and errors are linked with `aria-describedby`.
  - The button shows a spinner while sending, and a success card replaces the form.
- **404:** centred. The message is in your voice, with one "Back home" button and three quiet links.
- **Admin:**
  - Login: a centred card with a show/hide password toggle and a loading state.
  - Dashboard: filter chips with counts, search, status badges, and an empty state for each section. Delete now asks in a confirm dialog.
  - Editor: sticky action bar, Markdown toolbar with shortcuts, drag-and-drop and paste image upload, local autosave with restore, a warning before leaving with unsaved changes, and toasts. It works on a phone (checked at 390px).

### Motion

- Scroll reveal: an 8px fade-up the first time an element enters the viewport, with a 60ms stagger. It uses an `IntersectionObserver` and is off with reduced motion or without JS.
- Hovers and focus: 150–200ms ease-out.
- Route changes cross-fade in 180ms (`experimental.viewTransition` with React `<ViewTransition>`); reduced motion turns this off.
- Theme switching briefly disables transitions, so nothing animates mid-switch. next-themes' blocking script prevents a flash of the wrong theme on load.

### Checks

| Check | Result |
| --- | --- |
| Horizontal scroll at 360px, all 16 routes, both themes | none |
| `<h1>` per page | exactly one everywhere |
| Heading order | no skipped levels |
| Tap targets at 360px | ≥44px, except inline links inside prose and metadata, and heading anchors |
| Images without `alt` | none |
| CLS (home, measured in Chrome) | 0.000 |
| Lighthouse accessibility (local build) | 100 on home, post, case study, About and Contact |

### Small wording changes for layout

- Home "Selected work" section: the title is now "Selected work" (it was the eyebrow), and "Problems I've worked on" was dropped. "Recent writing" is now "Latest writing", and its one-line description was removed so it lines up with "Recent notes".
- Home hero: the "Read writing" button was removed, leaving two buttons; Writing is one click away in the header.
- 404: dropped "Here are a few places that do exist." The links below the button say the same thing.
- Contact success card: added a "Send another message" button.
- About sidebar: "Research" became **Focus**, listing full-stack product engineering, the SAU research internship and Founder, Bayana. These are the same facts as before, now kept in `siteContent.focus` in `data.ts`.
- Case studies: "My role" moved from the first body section into the meta row as **Role**, with the same text.

### Not done, and why

- **Year in the case-study meta row:** left out on purpose. Project `date` values are still placeholders used only for ordering (see `TODO.md`), so showing a year would display an unconfirmed fact. Add real dates, or ask for a `year` field, and it can go back in.
