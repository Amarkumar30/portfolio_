# /future v2: plan

Adds a daily to-do, a weekly plan, a calendar, a progress view and a daily quote to the private
planner. Privacy, storage and the existing events stay exactly as they are.

## Decisions

- **Tabs:** Today · Week · Calendar · Events · Progress. The existing events view becomes the Events
  tab with its behaviour unchanged. The last tab is remembered in `localStorage`.
- **Storage:** three new Redis hashes next to the untouched `future:events`: `future:tasks`
  (id → task), `future:goals` (id → goal) and `future:notes` (date → note). Locally each gets its
  own git-ignored file beside `.data/future.json`. The storage code is generalised so all four use
  one implementation, keeping the same keys and the same event behaviour.
- **Ranges:** APIs take `from`/`to` (or a week) and return only that range. The server still reads
  the hash and filters it, which is fine at personal scale (thousands of rows), and means no index
  to keep in sync.
- **Undo, not confirm,** for deleting tasks and goals: the item is deleted at once, and "Undo" puts
  the exact same item back.
- **Reorder:** native drag and drop on desktop (mouse only, so touch never triggers it), and Move up /
  Move down in each task's menu everywhere.
- **Streaks and the heatmap** count the IST day a task was *ticked* (`doneAt`); completion % counts
  the day it was *planned for* (`date`).
- **Quotes:** a hand-checked local list of real, well-attributed quotes in three themes, interleaved
  so consecutive days rotate theme. Day N shows item N mod length, so nothing repeats in a cycle.
  Quotes from translations name the work and translator where the wording depends on it.
- **Export/import:** exports are now version 2 (events, tasks, goals, notes). Version 1 files
  (events only) still import.

## New files

- `src/features/future/`: `planner-schema` (tasks, goals, notes, categories, import), `tasks`
  (ordering, summaries), `progress` (stats), `quotes`, and tests
- Components: `future-app` (shell, tabs, greeting), `quote-card`, `today-view`, `week-view`,
  `calendar-view`, `progress-view`, `task-list`, `use-planner`, `category-meta`
- `src/app/api/future/`: `tasks`, `tasks/[id]`, `tasks/reorder`, `tasks/move-to-today`, `goals`,
  `goals/[id]`, `notes`, `notes/[date]`, `progress`

## Existing files touched (all inside /future)

| File | Why |
| --- | --- |
| `src/features/future/store.ts` | One generic hash store for events and the three new collections |
| `src/features/future/dates.ts` | Week and month-grid helpers |
| `src/features/future/components/planner.tsx` | Split into `EventsView` (shared state) and the old `Planner` wrapper |
| `src/app/future/page.tsx` | Loads the first view's data and renders the new shell |
| `src/app/api/future/export` + `import` | Version 2 with tasks, goals and notes |
| `src/features/future/components/future-card.tsx` | "Today: 3/5 tasks done" on the dashboard |

The proxy already covers `/future` and `/api/future/*`, so no change is needed there. Nothing outside
`/future` changes.

## Baseline

`npm test` 70 of 70, `npm run lint` clean, `npm run build` passes.
