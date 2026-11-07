/**
 * "Amar's pick": entries from content/tech-picks, written in the admin.
 * The newest published pick from the last 7 days is pinned above the list.
 */
import { getEntries, getEntry } from "@/lib/content/loader";
import type { Entry } from "@/lib/content/loader";
import { PICK_DAYS } from "./config";
import { daysBetween, istDate } from "./format";
import type { TechPick } from "./types";

function toPick(entry: Entry<"tech-picks">): TechPick {
  return { slug: entry.slug, ...entry.data };
}

export function getPicks() {
  return getEntries("tech-picks").map(toPick);
}

/** The pick and its optional longer body, for the reading page. */
export function getPick(slug: string) {
  const entry = getEntry("tech-picks", slug);
  return entry ? { pick: toPick(entry), body: entry.body.trim() } : null;
}

export function latestPick(picks: TechPick[], now: Date) {
  const today = istDate(now);

  return (
    picks
      .filter((pick) => {
        const age = daysBetween(pick.date, today);
        return !pick.draft && age >= 0 && age <= PICK_DAYS;
      })
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
  );
}
