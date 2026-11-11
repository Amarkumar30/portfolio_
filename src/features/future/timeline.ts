/**
 * Everything the planner shows, worked out from the events and the current instant:
 * groups, order, the next event, countdowns, stats and filters. Pure, so it's tested directly.
 */
import { addDays, daysBetween, endOfWeek, istDate, monthDay, startMs } from "./dates";
import type { EventType, FutureEvent } from "./schema";

export const GROUPS = [
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "this-week", label: "This week" },
  { id: "next-week", label: "Next week" },
  { id: "this-month", label: "This month" },
  { id: "later", label: "Later" },
] as const;

export type GroupId = (typeof GROUPS)[number]["id"];

const HOUR_MS = 3_600_000;
const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 } as const;

const lastDay = (event: FutureEvent) => event.endDate ?? event.date;

export function groupOf(event: FutureEvent, now: number): GroupId {
  const today = istDate(now);
  const sunday = endOfWeek(today);

  if (lastDay(event) < today) return "overdue";
  if (event.date <= today) return "today";
  if (event.date === addDays(today, 1)) return "tomorrow";
  if (event.date <= sunday) return "this-week";
  if (event.date <= addDays(sunday, 7)) return "next-week";
  if (event.date.slice(0, 7) === today.slice(0, 7)) return "this-month";
  return "later";
}

/** Earliest first; all-day before timed on the same day; then high priority first. */
export function compareEvents(a: FutureEvent, b: FutureEvent) {
  return (
    a.date.localeCompare(b.date) ||
    (a.time ?? "").localeCompare(b.time ?? "") ||
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
    a.title.localeCompare(b.title)
  );
}

/** Upcoming events in their groups, nearest first. Empty groups are left out. */
export function groupEvents(events: FutureEvent[], now: number) {
  const upcoming = events.filter((event) => event.status === "upcoming").sort(compareEvents);

  return GROUPS.map((group) => ({
    ...group,
    events: upcoming.filter((event) => groupOf(event, now) === group.id),
  })).filter((group) => group.events.length > 0);
}

/** Done and skipped, most recent first. */
export function completedEvents(events: FutureEvent[]) {
  return events.filter((event) => event.status !== "upcoming").sort((a, b) => compareEvents(b, a));
}

/** A one-day event with a time that has already started is behind us, not next. */
function hasStarted(event: FutureEvent, now: number) {
  return Boolean(event.time) && !event.endDate && startMs(event.date, event.time) <= now;
}

export function nextUp(events: FutureEvent[], now: number) {
  return (
    events
      .filter((event) => event.status === "upcoming" && groupOf(event, now) !== "overdue")
      .filter((event) => !hasStarted(event, now))
      .sort(compareEvents)[0] ?? null
  );
}

/** Starts within 48 hours, or is already on. */
export function isSoon(event: FutureEvent, now: number) {
  return startMs(event.date, event.time) - now <= 48 * HOUR_MS;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** "in 2 days 4 hours", "Today at 10:00", "Starts in 45 min", "Overdue by 2 days"… */
export function countdown(event: FutureEvent, now: number) {
  if (event.status !== "upcoming") return "";

  const today = istDate(now);
  const end = lastDay(event);

  if (end < today) return `Overdue by ${plural(daysBetween(end, today), "day")}`;
  if (event.date < today) return end === today ? "Ends today" : `Ends ${monthDay(end)}`;

  const at = event.time ? ` at ${event.time}` : "";

  if (event.date === today) {
    if (!event.time) return "Today";
    const minutes = Math.ceil((startMs(event.date, event.time) - now) / 60_000);
    if (minutes <= 0) return `Started at ${event.time}`;
    if (minutes < 60) return `Starts in ${minutes} min`;
    return `Today${at}`;
  }

  if (event.date === addDays(today, 1)) return `Tomorrow${at}`;

  if (!event.time) return `in ${plural(daysBetween(today, event.date), "day")}`;

  const hoursLeft = Math.floor((startMs(event.date, event.time) - now) / HOUR_MS);
  const days = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;
  return `in ${plural(days, "day")}${hours ? ` ${plural(hours, "hour")}` : ""}`;
}

export function stats(events: FutureEvent[], now: number) {
  const sunday = endOfWeek(istDate(now));
  const active = events.filter((event) => event.status === "upcoming" && groupOf(event, now) !== "overdue");

  return {
    thisWeek: active.filter((event) => event.date <= sunday).length,
    exams: active.filter((event) => event.type === "exam").length,
    overdue: events.filter((event) => event.status === "upcoming" && groupOf(event, now) === "overdue")
      .length,
  };
}

export const FILTERS = [
  { id: "all", label: "All", types: [] },
  { id: "exam", label: "Exams", types: ["exam"] },
  { id: "quiz", label: "Quizzes", types: ["quiz"] },
  { id: "assignment", label: "Assignments", types: ["assignment"] },
  { id: "interview", label: "Interviews", types: ["interview"] },
  { id: "hackathon", label: "Hackathons", types: ["hackathon"] },
  { id: "deadline", label: "Deadlines", types: ["deadline"] },
  { id: "plan", label: "Plans", types: ["plan", "personal"] },
] as const satisfies readonly { id: string; label: string; types: readonly EventType[] }[];

export type FilterId = (typeof FILTERS)[number]["id"];

export function matchesFilter(event: FutureEvent, filter: FilterId, query: string) {
  const types: readonly EventType[] = FILTERS.find((item) => item.id === filter)?.types ?? [];
  if (types.length > 0 && !types.includes(event.type)) return false;

  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [event.title, event.course, event.notes, event.location].some((field) =>
    field?.toLowerCase().includes(needle),
  );
}
