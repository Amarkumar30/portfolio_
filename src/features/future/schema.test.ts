/**
 * Validation of every write, and plain-text rendering of what's stored.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ToastProvider } from "@/components/admin/toast";
import { Planner } from "./components/planner";
import { eventInputSchema, type FutureEvent } from "./schema";

const valid = { title: "DBMS mid-sem", date: "2026-11-14" };
const accepts = (input: object) => eventInputSchema.safeParse({ ...valid, ...input }).success;

test("defaults: a plan, normal priority, upcoming, no prep", () => {
  const parsed = eventInputSchema.parse(valid);
  assert.equal(parsed.type, "plan");
  assert.equal(parsed.priority, "normal");
  assert.equal(parsed.status, "upcoming");
  assert.deepEqual(parsed.prep, []);
});

test("empty optional fields are dropped, text is trimmed", () => {
  const parsed = eventInputSchema.parse({ ...valid, title: "  Quiz  ", time: "", course: " ", link: "" });
  assert.equal(parsed.title, "Quiz");
  assert.equal(parsed.time, undefined);
  assert.equal(parsed.course, undefined);
  assert.equal(parsed.link, undefined);
});

test("bad dates and times are rejected", () => {
  for (const date of ["2026-02-30", "2026-13-01", "14/11/2026", "2026-11-1", "", "tomorrow"]) {
    assert.ok(!accepts({ date }), date);
  }
  for (const time of ["25:00", "9:00", "10:60", "noon"]) assert.ok(!accepts({ time }), time);
  assert.ok(accepts({ time: "09:30" }));
  assert.ok(!accepts({ endDate: "2026-11-13" }), "end before start");
  assert.ok(accepts({ endDate: "2026-11-16" }));
});

test("javascript: and other non-web links are rejected", () => {
  for (const link of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,x", "ftp://example.com", "example.com"]) {
    assert.ok(!accepts({ link }), link);
  }
  assert.ok(accepts({ link: "https://example.com/syllabus" }));
});

test("size limits: title 120, notes 2,000, 30 prep items", () => {
  assert.ok(accepts({ title: "a".repeat(120) }));
  assert.ok(!accepts({ title: "a".repeat(121) }));
  assert.ok(accepts({ notes: "a".repeat(2000) }));
  assert.ok(!accepts({ notes: "a".repeat(2001) }));
  assert.ok(!accepts({ title: "   " }));
  assert.ok(!accepts({ prep: Array.from({ length: 31 }, () => ({ text: "x" })) }));
  assert.ok(!accepts({ prep: [{ text: "" }] }));
  assert.ok(!accepts({ type: "party" }));
  assert.ok(!accepts({ priority: "urgent" }));
});

test("HTML in an event renders as text", () => {
  const hostile = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  const event: FutureEvent = {
    ...eventInputSchema.parse({ ...valid, title: hostile, course: hostile, notes: hostile }),
    id: "event-0001",
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  };

  const html = renderToStaticMarkup(
    createElement(ToastProvider, null, createElement(Planner, { initialEvents: [event], initialNow: Date.parse("2026-11-11T10:00:00+05:30") })),
  );

  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes("<script>alert"));
  assert.ok(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
});

test("nothing in the planner uses dangerouslySetInnerHTML", () => {
  const folders = ["src/features/future", "src/app/future"];
  const files = folders.flatMap((folder) =>
    fs.readdirSync(folder, { recursive: true, encoding: "utf8" }).map((file) => path.join(folder, file)),
  );

  for (const file of files.filter((name) => /\.tsx?$/.test(name) && !name.endsWith(".test.ts"))) {
    assert.ok(!fs.readFileSync(file, "utf8").includes("dangerouslySetInnerHTML"), file);
  }
});
