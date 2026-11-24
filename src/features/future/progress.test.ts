/**
 * Progress maths with fixed data. "Now" is Tuesday 24 Nov 2026, 10:00 IST; this week is 23–29 Nov
 * and last week 16–22 Nov.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Category, DayNote, Task } from "./planner-schema";
import { bestStreak, computeProgress, currentStreak } from "./progress";
import type { FutureEvent } from "./schema";

const NOW = Date.parse("2026-11-24T10:00:00+05:30");
const stamp = "2026-11-01T00:00:00.000Z";
let counter = 0;

/** A task planned for `date`; if `doneOn` is given, ticked at noon IST that day. */
function task(date: string, doneOn: string | null = null, category: Category = "other"): Task {
  counter += 1;
  return {
    id: `task-${String(counter).padStart(6, "0")}`,
    title: `Task ${counter}`,
    date,
    category,
    priority: "normal",
    done: doneOn !== null,
    doneAt: doneOn ? new Date(Date.parse(`${doneOn}T12:00:00+05:30`)).toISOString() : null,
    order: 0,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function event(overrides: Partial<FutureEvent>): FutureEvent {
  counter += 1;
  return {
    id: `event-${String(counter).padStart(6, "0")}`,
    title: `Event ${counter}`,
    type: "exam",
    date: "2026-11-20",
    priority: "normal",
    status: "done",
    prep: [],
    createdAt: stamp,
    updatedAt: stamp,
    ...overrides,
  };
}

const run = (tasks: Task[], events: FutureEvent[] = [], notes: DayNote[] = []) =>
  computeProgress({ tasks, events, notes, now: NOW });

test("this week's completion, last week's, and the change", () => {
  const tasks = [
    // This week: 3 of 4 done.
    task("2026-11-23", "2026-11-23", "study"),
    task("2026-11-23", "2026-11-23", "study"),
    task("2026-11-24", "2026-11-24", "dsa"),
    task("2026-11-25"),
    // Last week: 3 of 5 done.
    task("2026-11-16", "2026-11-16"),
    task("2026-11-17", "2026-11-17"),
    task("2026-11-18", "2026-11-18"),
    task("2026-11-19"),
    task("2026-11-20"),
  ];
  const progress = run(tasks);

  assert.deepEqual(progress.week, { done: 3, total: 4, percent: 75 });
  assert.deepEqual(progress.lastWeek, { done: 3, total: 5, percent: 60 });
  assert.equal(progress.change, 15);
  assert.ok(progress.summary.startsWith("This week you finished 3 of 4 tasks (75%), up from 60% last week."), progress.summary);
  assert.ok(progress.summary.includes("Most of your work went into Study."), progress.summary);
});

test("no change can be shown without both weeks", () => {
  const progress = run([task("2026-11-23", "2026-11-23"), task("2026-11-24"), task("2026-11-25")]);
  assert.equal(progress.change, null);
  assert.equal(progress.lastWeek.percent, null);
});

test("a down week says so", () => {
  const progress = run([
    task("2026-11-23"),
    task("2026-11-24", "2026-11-24"),
    task("2026-11-16", "2026-11-16"),
    task("2026-11-17", "2026-11-17"),
  ]);
  assert.equal(progress.change, -50);
  assert.ok(progress.summary.includes("down from 100% last week"), progress.summary);
});

test("streaks: today with nothing done yet doesn't break it; a gap day does", () => {
  const days = new Set(["2026-11-23", "2026-11-22", "2026-11-21", "2026-11-19", "2026-11-18"]);
  assert.equal(currentStreak(days, "2026-11-24"), 3); // today empty, counts from yesterday
  days.add("2026-11-24");
  assert.equal(currentStreak(days, "2026-11-24"), 4);
  assert.equal(currentStreak(new Set(["2026-11-22"]), "2026-11-24"), 0); // two days ago only
  assert.equal(currentStreak(new Set(), "2026-11-24"), 0);
});

test("best streak is the longest run, anywhere in the past", () => {
  assert.equal(bestStreak(new Set(["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-20", "2026-11-21"])), 4);
  assert.equal(bestStreak(new Set(["2026-11-30", "2026-12-01"])), 2); // across a month
  assert.equal(bestStreak(new Set()), 0);
});

test("streaks count the day a task was ticked, not the day it was planned for", () => {
  const progress = run([task("2026-11-01", "2026-11-23"), task("2026-11-02", "2026-11-22"), task("2026-11-24")]);
  assert.equal(progress.streak, 2);
  assert.equal(progress.bestStreak, 2);
});

test("category totals over the last 30 days, biggest first", () => {
  const progress = run([
    task("2026-11-20", "2026-11-20", "dsa"),
    task("2026-11-21", "2026-11-21", "dsa"),
    task("2026-11-22", "2026-11-22", "health"),
    task("2026-10-01", "2026-10-01", "study"), // older than 30 days
    task("2026-11-23", null, "project"), // not done
  ]);
  assert.deepEqual(progress.categories.map((item) => [item.label, item.count]), [
    ["DSA", 2],
    ["Health", 1],
  ]);
});

test("best weekday over the last 8 weeks", () => {
  const progress = run([
    task("2026-11-16", "2026-11-16"), // Monday
    task("2026-11-09", "2026-11-09"), // Monday
    task("2026-11-18", "2026-11-18"), // Wednesday
    task("2026-09-02", "2026-09-02"), // Wednesday, outside 8 weeks
    task("2026-09-09", "2026-09-09"),
  ]);
  assert.deepEqual(progress.bestWeekday, { weekday: "Monday", count: 2 });
  assert.equal(run([task("2026-11-24")]).bestWeekday, null);
});

test("events done: exams, quizzes and interviews in the last 30 days", () => {
  const progress = run(
    [task("2026-11-23"), task("2026-11-22"), task("2026-11-21")],
    [
      event({ title: "DBMS exam", type: "exam", date: "2026-11-20" }),
      event({ title: "Mock interview", type: "interview", date: "2026-11-10" }),
      event({ title: "Skipped quiz", type: "quiz", status: "skipped" }),
      event({ title: "Old exam", type: "exam", date: "2026-10-01" }),
      event({ title: "A plan", type: "plan" }),
      event({ title: "Upcoming quiz", type: "quiz", status: "upcoming" }),
    ],
  );
  assert.deepEqual(progress.eventsDone.map((item) => item.title), ["DBMS exam", "Mock interview"]);
});

test("your lines: the last 7, newest first, none from the future", () => {
  const notes: DayNote[] = Array.from({ length: 10 }, (_, index) => ({
    date: `2026-11-${String(16 + index).padStart(2, "0")}`,
    text: `Line ${16 + index}`,
    updatedAt: stamp,
  }));
  const progress = run([task("2026-11-23"), task("2026-11-22"), task("2026-11-21")], [], notes);
  assert.deepEqual(progress.lines.map((line) => line.date), ["2026-11-24", "2026-11-23", "2026-11-22", "2026-11-21", "2026-11-20", "2026-11-19", "2026-11-18"]);
});

test("the heatmap: 12 Monday-first weeks ending this week, empty days stay empty", () => {
  const progress = run([
    task("2026-11-23", "2026-11-23"),
    task("2026-11-23", "2026-11-23"),
    task("2026-11-22", null),
  ]);
  const days = progress.heatmap;

  assert.equal(days.length, 84);
  assert.equal(days[0].date, "2026-09-07"); // a Monday, 11 weeks before this one
  assert.equal(days[days.length - 1].date, "2026-11-29");
  assert.deepEqual(days.find((day) => day.date === "2026-11-23"), { date: "2026-11-23", count: 2, planned: 2, level: 2, future: false });
  assert.deepEqual(days.find((day) => day.date === "2026-11-22"), { date: "2026-11-22", count: 0, planned: 1, level: 0, future: false });
  assert.equal(days.find((day) => day.date === "2026-11-25")?.future, true);
  assert.equal(days.find((day) => day.date === "2026-10-01")?.planned, 0);
});

test("not enough data: fewer than 3 days with tasks", () => {
  assert.equal(run([task("2026-11-23"), task("2026-11-23"), task("2026-11-24")]).enough, false);
  assert.equal(run([task("2026-11-22"), task("2026-11-23"), task("2026-11-24")]).enough, true);
  assert.equal(run([]).enough, false);
  assert.ok(run([]).summary.includes("No tasks planned this week yet."));
  assert.ok(run([]).summary.includes("Tick one task today to start a streak."));
});
