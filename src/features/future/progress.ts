/**
 * The Progress tab's numbers, worked out from tasks, events and notes. Pure and rule-based (no AI),
 * so every number can be checked by hand.
 * - Completion % uses the day a task was planned for.
 * - Streaks, the heatmap, categories and the best weekday use the IST day it was ticked.
 */
import { addDays, daysBetween, istDate, startOfWeek, weekdayLabel } from "./dates";
import { CATEGORIES, CATEGORY_LABELS, type Category, type DayNote, type Task } from "./planner-schema";
import type { FutureEvent } from "./schema";

export const HEATMAP_WEEKS = 12;
const CATEGORY_DAYS = 30;
const WEEKDAY_DAYS = 56;
const EVENT_DAYS = 30;
const LINES = 7;
const MIN_PLANNED_DAYS = 3;

export interface Ratio {
  done: number;
  total: number;
  /** Rounded percentage, or null when nothing was planned. */
  percent: number | null;
}

export interface HeatmapDay {
  date: string;
  /** Tasks ticked that day. */
  count: number;
  /** Tasks planned for that day. */
  planned: number;
  /** 0 (none ticked) to 4 (busiest). */
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

export interface Progress {
  enough: boolean;
  summary: string;
  week: Ratio;
  lastWeek: Ratio;
  /** Percentage points, this week minus last week; null unless both weeks had tasks. */
  change: number | null;
  streak: number;
  bestStreak: number;
  heatmap: HeatmapDay[];
  categories: { category: Category; label: string; count: number }[];
  bestWeekday: { weekday: string; count: number } | null;
  eventsDone: { title: string; type: FutureEvent["type"]; date: string }[];
  lines: { date: string; text: string }[];
}

function ratio(items: Task[]): Ratio {
  const done = items.filter((task) => task.done).length;
  return { done, total: items.length, percent: items.length ? Math.round((done / items.length) * 100) : null };
}

/** IST day of a done task's tick. */
function doneDay(task: Task) {
  return task.done && task.doneAt ? istDate(Date.parse(task.doneAt)) : null;
}

/** Days in a row with something ticked, ending today — or yesterday, if today has nothing yet. */
export function currentStreak(days: Set<string>, today: string) {
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

export function bestStreak(days: Set<string>) {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  sorted.forEach((day, index) => {
    run = index > 0 && daysBetween(sorted[index - 1], day) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

function level(count: number): HeatmapDay["level"] {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function computeProgress({
  tasks,
  events,
  notes,
  now,
}: {
  tasks: Task[];
  events: FutureEvent[];
  notes: DayNote[];
  now: number;
}): Progress {
  const today = istDate(now);
  const monday = startOfWeek(today);
  const lastMonday = addDays(monday, -7);
  const between = (date: string, from: string, to: string) => date >= from && date <= to;

  const week = ratio(tasks.filter((task) => between(task.date, monday, addDays(monday, 6))));
  const lastWeek = ratio(tasks.filter((task) => between(task.date, lastMonday, addDays(lastMonday, 6))));
  const change = week.percent !== null && lastWeek.percent !== null ? week.percent - lastWeek.percent : null;

  const ticks = new Map<string, Task[]>();
  for (const task of tasks) {
    const day = doneDay(task);
    if (day) ticks.set(day, [...(ticks.get(day) ?? []), task]);
  }
  const tickedDays = new Set(ticks.keys());
  const ticked = (from: string, to: string) =>
    [...ticks.entries()].filter(([day]) => between(day, from, to)).flatMap(([, list]) => list);

  const plannedPerDay = new Map<string, number>();
  for (const task of tasks) plannedPerDay.set(task.date, (plannedPerDay.get(task.date) ?? 0) + 1);

  const heatmapStart = addDays(monday, -7 * (HEATMAP_WEEKS - 1));
  const heatmap = Array.from({ length: HEATMAP_WEEKS * 7 }, (_, index): HeatmapDay => {
    const date = addDays(heatmapStart, index);
    const count = ticks.get(date)?.length ?? 0;
    return { date, count, planned: plannedPerDay.get(date) ?? 0, level: level(count), future: date > today };
  });

  const recent = ticked(addDays(today, -(CATEGORY_DAYS - 1)), today);
  const categories = CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    count: recent.filter((task) => task.category === category).length,
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const perWeekday = new Map<string, number>();
  for (const task of ticked(addDays(today, -(WEEKDAY_DAYS - 1)), today)) {
    const weekday = weekdayLabel(doneDay(task)!);
    perWeekday.set(weekday, (perWeekday.get(weekday) ?? 0) + 1);
  }
  // Monday first, so ties go to the earlier day.
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayLabel(addDays(monday, index)));
  const bestWeekday = weekdays.reduce<{ weekday: string; count: number } | null>((best, weekday) => {
    const count = perWeekday.get(weekday) ?? 0;
    return count > 0 && (!best || count > best.count) ? { weekday, count } : best;
  }, null);

  const eventsDone = events
    .filter(
      (event) =>
        event.status === "done" &&
        ["exam", "quiz", "interview"].includes(event.type) &&
        between(event.date, addDays(today, -(EVENT_DAYS - 1)), today),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ title, type, date }) => ({ title, type, date }));

  const lines = notes
    .filter((note) => note.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, LINES)
    .map(({ date, text }) => ({ date, text }));

  const streak = currentStreak(tickedDays, today);
  const enough = plannedPerDay.size >= MIN_PLANNED_DAYS;

  return {
    enough,
    summary: summarise({ week, lastWeek, change, streak, weekTasks: ticked(monday, today), recent }),
    week,
    lastWeek,
    change,
    streak,
    bestStreak: bestStreak(tickedDays),
    heatmap,
    categories,
    bestWeekday,
    eventsDone,
    lines,
  };
}

function topCategory(tasks: Task[]) {
  const counts = new Map<Category, number>();
  for (const task of tasks) counts.set(task.category, (counts.get(task.category) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1] || CATEGORIES.indexOf(a[0]) - CATEGORIES.indexOf(b[0]));
  return top ? CATEGORY_LABELS[top[0]] : null;
}

function summarise({
  week,
  lastWeek,
  change,
  streak,
  weekTasks,
  recent,
}: {
  week: Ratio;
  lastWeek: Ratio;
  change: number | null;
  streak: number;
  weekTasks: Task[];
  recent: Task[];
}) {
  const parts: string[] = [];

  if (week.total === 0) {
    parts.push("No tasks planned this week yet.");
  } else {
    let sentence = `This week you finished ${week.done} of ${plural(week.total, "task")} (${week.percent}%)`;
    if (change !== null) {
      sentence +=
        change > 0
          ? `, up from ${lastWeek.percent}% last week`
          : change < 0
            ? `, down from ${lastWeek.percent}% last week`
            : ", the same as last week";
    }
    parts.push(`${sentence}.`);
  }

  const top = topCategory(weekTasks) ?? topCategory(recent);
  if (top) parts.push(`Most of your work went into ${top}.`);

  parts.push(streak > 0 ? `Current streak: ${plural(streak, "day")}.` : "Tick one task today to start a streak.");

  return parts.join(" ");
}
