import { DAILY_TIME_ZONE } from "./config";

/** Today's date in IST as YYYY-MM-DD (the day flips at midnight Asia/Kolkata). */
export function todayInIst(now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Days since 1970-01-01 for a YYYY-MM-DD date; consecutive days give consecutive numbers. */
export function dayNumber(date: string) {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

/**
 * Deterministic pick: the same item for everyone on a given day, walking through the list in
 * order so nothing repeats until the whole list has been shown.
 */
export function pickForDay<T>(list: readonly T[], day: number, offset = 0): T {
  const index = (((day + offset) % list.length) + list.length) % list.length;
  return list[index];
}

/** "31 Oct 2026" */
export function formatDailyDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
