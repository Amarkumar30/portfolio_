/**
 * Grouping, order, countdowns and stats, with the clock fixed in IST.
 * Wednesday 11 Nov 2026: this week runs to Sunday the 15th, next week to the 22nd.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { FutureEvent } from "./schema";
import { completedEvents, countdown, groupEvents, groupOf, isSoon, matchesFilter, nextUp, stats } from "./timeline";

const ist = (local: string) => Date.parse(`${local}+05:30`);
const NOW = ist("2026-11-11T10:00:00");

let counter = 0;
function event(overrides: Partial<FutureEvent>): FutureEvent {
  counter += 1;
  return {
    id: `event-${String(counter).padStart(4, "0")}`,
    title: `Event ${counter}`,
    type: "plan",
    date: "2026-11-11",
    priority: "normal",
    status: "upcoming",
    prep: [],
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    ...overrides,
  };
}

test("every group, nearest first, overdue on top and empty groups left out", () => {
  const events = [
    event({ title: "Later", date: "2026-12-03" }),
    event({ title: "This month", date: "2026-11-27" }),
    event({ title: "Next week", date: "2026-11-18" }),
    event({ title: "This week", date: "2026-11-14" }),
    event({ title: "Tomorrow", date: "2026-11-12" }),
    event({ title: "Today", date: "2026-11-11" }),
    event({ title: "Overdue", date: "2026-11-10" }),
    event({ title: "Done", date: "2026-11-11", status: "done" }),
  ];

  const groups = groupEvents(events, NOW);

  assert.deepEqual(
    groups.map((group) => [group.id, group.events.map((item) => item.title)]),
    [
      ["overdue", ["Overdue"]],
      ["today", ["Today"]],
      ["tomorrow", ["Tomorrow"]],
      ["this-week", ["This week"]],
      ["next-week", ["Next week"]],
      ["this-month", ["This month"]],
      ["later", ["Later"]],
    ],
  );
});

test("the day turns at midnight IST, not UTC (23:59 → 00:01)", () => {
  const thursday = event({ date: "2026-11-12" });
  const wednesday = event({ date: "2026-11-11" });
  const before = ist("2026-11-11T23:59:00");
  const after = ist("2026-11-12T00:01:00"); // still the 11th in UTC

  assert.equal(groupOf(thursday, before), "tomorrow");
  assert.equal(groupOf(wednesday, before), "today");
  assert.equal(groupOf(thursday, after), "today");
  assert.equal(groupOf(wednesday, after), "overdue");
  assert.equal(countdown(thursday, before), "Tomorrow");
  assert.equal(countdown(thursday, after), "Today");
});

test("Sunday's tomorrow is next week's Monday, shown as Tomorrow", () => {
  const sunday = ist("2026-11-15T12:00:00");
  assert.equal(groupOf(event({ date: "2026-11-16" }), sunday), "tomorrow");
  assert.equal(groupOf(event({ date: "2026-11-17" }), sunday), "next-week");
});

test("multi-day events stay current until their last day", () => {
  const running = event({ date: "2026-11-10", endDate: "2026-11-12" });
  const finished = event({ date: "2026-11-08", endDate: "2026-11-10" });
  const endsToday = event({ date: "2026-11-09", endDate: "2026-11-11" });

  assert.equal(groupOf(running, NOW), "today");
  assert.equal(countdown(running, NOW), "Ends Nov 12");
  assert.equal(countdown(endsToday, NOW), "Ends today");
  assert.equal(groupOf(finished, NOW), "overdue");
  assert.equal(countdown(finished, NOW), "Overdue by 1 day");
});

test("countdowns", () => {
  assert.equal(countdown(event({ date: "2026-11-11", time: "10:45" }), NOW), "Starts in 45 min");
  assert.equal(countdown(event({ date: "2026-11-11", time: "15:30" }), NOW), "Today at 15:30");
  assert.equal(countdown(event({ date: "2026-11-11", time: "09:00" }), NOW), "Started at 09:00");
  assert.equal(countdown(event({ date: "2026-11-11" }), NOW), "Today");
  assert.equal(countdown(event({ date: "2026-11-12", time: "09:00" }), NOW), "Tomorrow at 09:00");
  assert.equal(countdown(event({ date: "2026-11-13", time: "14:00" }), NOW), "in 2 days 4 hours");
  assert.equal(countdown(event({ date: "2026-11-14", time: "10:00" }), NOW), "in 3 days");
  assert.equal(countdown(event({ date: "2026-11-16" }), NOW), "in 5 days");
  assert.equal(countdown(event({ date: "2026-11-08" }), NOW), "Overdue by 3 days");
  assert.equal(countdown(event({ date: "2026-11-11", status: "done" }), NOW), "");
});

test("same day: all-day first, then by time, then high priority first", () => {
  const events = [
    event({ title: "Late", time: "18:00" }),
    event({ title: "Normal all-day" }),
    event({ title: "High all-day", priority: "high" }),
    event({ title: "Early", time: "11:00" }),
  ];

  assert.deepEqual(
    groupEvents(events, NOW)[0].events.map((item) => item.title),
    ["High all-day", "Normal all-day", "Early", "Late"],
  );
});

test("next up skips overdue, finished and already-started events", () => {
  const events = [
    event({ title: "Overdue", date: "2026-11-09" }),
    event({ title: "Started", date: "2026-11-11", time: "09:00" }),
    event({ title: "Done", date: "2026-11-11", time: "11:00", status: "done" }),
    event({ title: "Next", date: "2026-11-11", time: "12:00" }),
    event({ title: "After", date: "2026-11-12" }),
  ];

  assert.equal(nextUp(events, NOW)?.title, "Next");
  assert.equal(nextUp([], NOW), null);
});

test("next up keeps a multi-day event that's running", () => {
  const running = event({ title: "Hackathon", date: "2026-11-10", endDate: "2026-11-12", time: "09:00" });
  assert.equal(nextUp([running, event({ date: "2026-11-20" })], NOW)?.title, "Hackathon");
});

test("soon means within 48 hours", () => {
  assert.ok(isSoon(event({ date: "2026-11-13", time: "09:00" }), NOW));
  assert.ok(!isSoon(event({ date: "2026-11-13", time: "11:00" }), NOW));
});

test("stats count this week, upcoming exams and overdue", () => {
  const events = [
    event({ date: "2026-11-11", type: "exam" }),
    event({ date: "2026-11-15" }),
    event({ date: "2026-11-20", type: "exam" }),
    event({ date: "2026-11-09" }),
    event({ date: "2026-11-09", type: "exam" }),
    event({ date: "2026-11-12", status: "skipped" }),
  ];

  assert.deepEqual(stats(events, NOW), { thisWeek: 2, exams: 2, overdue: 2 });
});

test("completed events, most recent first", () => {
  const events = [
    event({ title: "Old", date: "2026-11-01", status: "done" }),
    event({ title: "Recent", date: "2026-11-10", status: "skipped" }),
    event({ title: "Open" }),
  ];

  assert.deepEqual(completedEvents(events).map((item) => item.title), ["Recent", "Old"]);
});

test("filters by type and searches title, course and notes", () => {
  const exam = event({ type: "exam", title: "Mid-sem", course: "DBMS" });
  const personal = event({ type: "personal", title: "Dinner", notes: "Book a table" });

  assert.ok(matchesFilter(exam, "exam", ""));
  assert.ok(!matchesFilter(personal, "exam", ""));
  assert.ok(matchesFilter(personal, "plan", ""));
  assert.ok(matchesFilter(exam, "all", "dbms"));
  assert.ok(matchesFilter(personal, "all", "TABLE"));
  assert.ok(!matchesFilter(exam, "all", "table"));
});
