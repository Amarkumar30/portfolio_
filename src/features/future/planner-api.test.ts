/**
 * The task, goal, note and progress APIs: who can reach them, and what they do in the local file
 * store. Storage is a temporary folder, never .data/.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import * as goal from "@/app/api/future/goals/[id]/route";
import * as goals from "@/app/api/future/goals/route";
import * as importer from "@/app/api/future/import/route";
import * as note from "@/app/api/future/notes/[date]/route";
import * as notes from "@/app/api/future/notes/route";
import * as progress from "@/app/api/future/progress/route";
import * as task from "@/app/api/future/tasks/[id]/route";
import * as move from "@/app/api/future/tasks/move-to-today/route";
import * as reorder from "@/app/api/future/tasks/reorder/route";
import * as tasks from "@/app/api/future/tasks/route";
import { createSessionToken } from "@/lib/admin/session";
import { FUTURE_HIDDEN_PATH, proxy } from "@/proxy";
import { istDate } from "./dates";
import type { Goal, Task } from "./planner-schema";

// Every module here reads these when called, not when imported.
const SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.ADMIN_SESSION_SECRET = SECRET;
process.env.ADMIN_USERNAME = "tester";
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "future-v2-test-"));
process.env.FUTURE_DATA_FILE = path.join(dataDir, "future.json");

const ORIGIN = "http://localhost:3000";
const TODAY = istDate(Date.now());
let session = "";
let forged = "";
let expired = "";

before(async () => {
  session = await createSessionToken("tester");
  const sign = (key: string, expires: number) =>
    new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("tester")
      .setAudience("portfolio-admin")
      .setIssuedAt()
      .setExpirationTime(expires)
      .sign(new TextEncoder().encode(key));
  forged = await sign("a-different-secret-also-32-characters-long!!", Math.floor(Date.now() / 1000) + 3600);
  expired = await sign(SECRET, Math.floor(Date.now() / 1000) - 60);
});

beforeEach(() => {
  for (const file of fs.readdirSync(dataDir)) fs.rmSync(path.join(dataDir, file), { force: true });
});
after(() => fs.rmSync(dataDir, { recursive: true, force: true }));

interface Options {
  method?: string;
  token?: string | null;
  origin?: string | null;
  body?: unknown;
}

function req(pathname: string, { method = "GET", token = session, origin = ORIGIN, body }: Options = {}) {
  const headers: Record<string, string> = { "x-forwarded-host": "localhost:3000", "content-type": "application/json" };
  if (token) headers.cookie = `admin_session=${token}`;
  if (origin) headers.origin = origin;
  return new NextRequest(`${ORIGIN}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

const params = <K extends string>(key: K, value: string) => ({ params: Promise.resolve({ [key]: value } as Record<K, string>) });

async function call(response: Promise<Response> | Response) {
  const result = await response;
  return { status: result.status, headers: result.headers, body: await result.json().catch(() => null) };
}

async function addTask(title: string, date = TODAY, extra: object = {}) {
  const { status, body } = await call(tasks.POST(req("/api/future/tasks", { method: "POST", body: { title, date, ...extra } })));
  assert.equal(status, 201, JSON.stringify(body));
  return body.task as Task;
}

const listTasks = async (from = TODAY, to = TODAY) =>
  (await call(tasks.GET(req(`/api/future/tasks?from=${from}&to=${to}`)))).body.tasks as Task[];

/** Every new handler, called the way a browser would. */
function everyHandler(token: string | null, origin: string | null = ORIGIN) {
  const id = "00000000-0000-4000-8000-000000000000";
  const write = { title: "Secret task", date: TODAY };
  return [
    ["GET tasks", () => tasks.GET(req(`/api/future/tasks?from=${TODAY}&to=${TODAY}`, { token, origin }))],
    ["POST tasks", () => tasks.POST(req("/api/future/tasks", { method: "POST", body: write, token, origin }))],
    ["PATCH task", () => task.PATCH(req(`/api/future/tasks/${id}`, { method: "PATCH", body: { done: true }, token, origin }), params("id", id))],
    ["PUT task", () => task.PUT(req(`/api/future/tasks/${id}`, { method: "PUT", body: {}, token, origin }), params("id", id))],
    ["DELETE task", () => task.DELETE(req(`/api/future/tasks/${id}`, { method: "DELETE", token, origin }), params("id", id))],
    ["POST reorder", () => reorder.POST(req("/api/future/tasks/reorder", { method: "POST", body: { ids: [id] }, token, origin }))],
    ["POST move", () => move.POST(req("/api/future/tasks/move-to-today", { method: "POST", body: { ids: [id] }, token, origin }))],
    ["GET goals", () => goals.GET(req("/api/future/goals?week=2026-11-23", { token, origin }))],
    ["POST goals", () => goals.POST(req("/api/future/goals", { method: "POST", body: { weekStart: "2026-11-23", title: "x" }, token, origin }))],
    ["PATCH goal", () => goal.PATCH(req(`/api/future/goals/${id}`, { method: "PATCH", body: { done: true }, token, origin }), params("id", id))],
    ["DELETE goal", () => goal.DELETE(req(`/api/future/goals/${id}`, { method: "DELETE", token, origin }), params("id", id))],
    ["GET notes", () => notes.GET(req(`/api/future/notes?from=${TODAY}&to=${TODAY}`, { token, origin }))],
    ["PUT note", () => note.PUT(req(`/api/future/notes/${TODAY}`, { method: "PUT", body: { text: "x" }, token, origin }), params("date", TODAY))],
    ["DELETE note", () => note.DELETE(req(`/api/future/notes/${TODAY}`, { method: "DELETE", token, origin }), params("date", TODAY))],
    ["GET progress", () => progress.GET(req("/api/future/progress", { token, origin }))],
  ] as const;
}

test("proxy: every new path is the ordinary 404 without a session", async () => {
  const paths = ["/api/future/tasks", "/api/future/tasks/x", "/api/future/tasks/reorder", "/api/future/tasks/move-to-today", "/api/future/goals", "/api/future/notes/2026-11-24", "/api/future/progress"];
  for (const token of [null, forged, expired]) {
    for (const pathname of paths) {
      const response = await proxy(req(pathname, { token }));
      assert.ok(response.headers.get("x-middleware-rewrite")?.endsWith(FUTURE_HIDDEN_PATH), pathname);
    }
  }
});

test("logged out, forged or expired: 404 and no data from every new handler", async () => {
  await addTask("Secret task");
  await call(note.PUT(req(`/api/future/notes/${TODAY}`, { method: "PUT", body: { text: "Secret line" } }), params("date", TODAY)));

  for (const token of [null, forged, expired]) {
    for (const [name, handler] of everyHandler(token)) {
      const response: Response = await handler();
      const text = await response.text();
      assert.equal(response.status, 404, `${name} with ${token?.slice(0, 6)}`);
      assert.ok(!/Secret (task|line)/.test(text), name);
    }
  }

  assert.equal((await listTasks()).length, 1);
});

test("cross-origin writes are rejected even with a valid session", async () => {
  for (const origin of ["https://evil.example", null]) {
    for (const [name, handler] of everyHandler(session, origin)) {
      if (name.startsWith("GET")) continue;
      assert.equal((await handler()).status, 403, `${name} from ${origin}`);
    }
  }
  assert.equal((await listTasks()).length, 0);
});

test("responses are private and never indexed", async () => {
  for (const [name, handler] of everyHandler(session)) {
    if (!name.startsWith("GET")) continue;
    const response = await handler();
    assert.equal(response.headers.get("cache-control"), "private, no-store", name);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", name);
  }
});

test("tasks: create, edit, tick, untick, delete and undo", async () => {
  const first = await addTask("Revise unit 3", TODAY, { category: "study", priority: "high" });
  const second = await addTask("Solve 3 DSA problems", TODAY, { category: "dsa" });
  assert.equal(first.order, 0);
  assert.equal(second.order, 1);
  assert.equal(first.done, false);

  const edited = await call(task.PATCH(req(`/api/future/tasks/${first.id}`, { method: "PATCH", body: { title: "Revise unit 4" } }), params("id", first.id)));
  assert.equal(edited.body.task.title, "Revise unit 4");

  const ticked = (await call(task.PATCH(req(`/api/future/tasks/${first.id}`, { method: "PATCH", body: { done: true } }), params("id", first.id)))).body.task as Task;
  assert.equal(ticked.done, true);
  assert.ok(ticked.doneAt);

  const unticked = (await call(task.PATCH(req(`/api/future/tasks/${first.id}`, { method: "PATCH", body: { done: false } }), params("id", first.id)))).body.task as Task;
  assert.equal(unticked.doneAt, null);

  assert.equal((await call(task.DELETE(req(`/api/future/tasks/${second.id}`, { method: "DELETE" }), params("id", second.id)))).status, 200);
  assert.deepEqual((await listTasks()).map((item) => item.title), ["Revise unit 4"]);

  // Undo puts back exactly what was deleted.
  const restored = await call(task.PUT(req(`/api/future/tasks/${second.id}`, { method: "PUT", body: second }), params("id", second.id)));
  assert.equal(restored.status, 200);
  assert.deepEqual((await listTasks()).find((item) => item.id === second.id), second);

  assert.equal((await call(task.DELETE(req("/api/future/tasks/nope0000", { method: "DELETE" }), params("id", "nope0000")))).status, 404);
});

test("tasks: only the requested date range comes back", async () => {
  await addTask("Monday", "2026-11-23");
  await addTask("Wednesday", "2026-11-25");
  await addTask("Next week", "2026-12-02");

  assert.deepEqual((await listTasks("2026-11-23", "2026-11-29")).map((item) => item.title).sort(), ["Monday", "Wednesday"]);
  assert.equal((await call(tasks.GET(req("/api/future/tasks?from=2026-11-29&to=2026-11-23")))).status, 400);
  assert.equal((await call(tasks.GET(req("/api/future/tasks?from=2020-01-01&to=2026-11-23")))).status, 400);
  assert.equal((await call(tasks.GET(req("/api/future/tasks")))).status, 400);
});

test("tasks: reorder", async () => {
  const [a, b, c] = [await addTask("A"), await addTask("B"), await addTask("C")];
  const result = await call(reorder.POST(req("/api/future/tasks/reorder", { method: "POST", body: { ids: [c.id, a.id, b.id] } })));
  assert.equal(result.status, 200);
  assert.deepEqual((await listTasks()).map((item) => item.title), ["C", "A", "B"]);
});

test("tasks: unfinished from earlier, then move to today", async () => {
  const already = await addTask("Already today");
  const old = await addTask("From Monday", "2020-01-06");
  const older = await addTask("From Sunday", "2020-01-05");
  const doneOld = await addTask("Done earlier", "2020-01-06");
  await call(task.PATCH(req(`/api/future/tasks/${doneOld.id}`, { method: "PATCH", body: { done: true } }), params("id", doneOld.id)));

  const earlier = (await call(tasks.GET(req(`/api/future/tasks?before=${TODAY}`)))).body.tasks as Task[];
  assert.deepEqual(earlier.map((item) => item.title), ["From Sunday", "From Monday"]);

  const moved = await call(move.POST(req("/api/future/tasks/move-to-today", { method: "POST", body: { ids: [old.id, older.id, doneOld.id] } })));
  assert.equal(moved.body.date, TODAY);
  // The done one stays where it was; the others go after what's already there, oldest first.
  assert.deepEqual((await listTasks()).map((item) => [item.title, item.order]), [
    ["Already today", already.order],
    ["From Sunday", 1],
    ["From Monday", 2],
  ]);
  assert.equal(((await call(tasks.GET(req(`/api/future/tasks?before=${TODAY}`)))).body.tasks as Task[]).length, 0);
});

test("weekly goals: add, tick, edit, delete, undo; Mondays only", async () => {
  const created = await call(goals.POST(req("/api/future/goals", { method: "POST", body: { weekStart: "2026-11-23", title: "Finish ADSA unit 3" } })));
  assert.equal(created.status, 201);
  const made = created.body.goal as Goal;

  const ticked = await call(goal.PATCH(req(`/api/future/goals/${made.id}`, { method: "PATCH", body: { done: true, title: "Finish ADSA unit 4" } }), params("id", made.id)));
  assert.equal(ticked.body.goal.done, true);
  assert.equal(ticked.body.goal.title, "Finish ADSA unit 4");

  const week = (await call(goals.GET(req("/api/future/goals?week=2026-11-23")))).body.goals as Goal[];
  assert.equal(week.length, 1);
  assert.equal((await call(goals.GET(req("/api/future/goals?week=2026-11-30")))).body.goals.length, 0);

  assert.equal((await call(goal.DELETE(req(`/api/future/goals/${made.id}`, { method: "DELETE" }), params("id", made.id)))).status, 200);
  assert.equal((await call(goal.PUT(req(`/api/future/goals/${made.id}`, { method: "PUT", body: week[0] }), params("id", made.id)))).status, 200);
  assert.equal((await call(goals.GET(req("/api/future/goals?week=2026-11-23")))).body.goals.length, 1);

  assert.equal((await call(goals.POST(req("/api/future/goals", { method: "POST", body: { weekStart: "2026-11-24", title: "Tuesday" } })))).status, 400);
  assert.equal((await call(goals.GET(req("/api/future/goals?week=2026-11-24")))).status, 400);
});

test("day notes: save, replace, clear", async () => {
  const saved = await call(note.PUT(req("/api/future/notes/2026-11-24", { method: "PUT", body: { text: "  Good focus today.  " } }), params("date", "2026-11-24")));
  assert.equal(saved.body.note.text, "Good focus today.");

  await call(note.PUT(req("/api/future/notes/2026-11-24", { method: "PUT", body: { text: "Better focus." } }), params("date", "2026-11-24")));
  const range = await call(notes.GET(req("/api/future/notes?from=2026-11-01&to=2026-11-30")));
  assert.deepEqual(range.body.notes.map((item: { text: string }) => item.text), ["Better focus."]);

  await call(note.PUT(req("/api/future/notes/2026-11-24", { method: "PUT", body: { text: "" } }), params("date", "2026-11-24")));
  assert.equal((await call(notes.GET(req("/api/future/notes?from=2026-11-01&to=2026-11-30")))).body.notes.length, 0);

  const tooLong = await call(note.PUT(req("/api/future/notes/2026-11-24", { method: "PUT", body: { text: "a".repeat(281) } }), params("date", "2026-11-24")));
  assert.equal(tooLong.status, 400);
  assert.equal((await call(note.PUT(req("/api/future/notes/2026-02-30", { method: "PUT", body: { text: "x" } }), params("date", "2026-02-30")))).status, 400);
});

test("validation: oversized titles, bad dates and categories are refused; HTML is stored as text", async () => {
  const bad = [
    { title: "a".repeat(161), date: TODAY },
    { title: "   ", date: TODAY },
    { title: "x", date: "2026-02-30" },
    { title: "x", date: "24/11/2026" },
    { title: "x", date: TODAY, category: "party" },
    { title: "x", date: TODAY, priority: "urgent" },
  ];
  for (const body of bad) {
    assert.equal((await call(tasks.POST(req("/api/future/tasks", { method: "POST", body })))).status, 400, JSON.stringify(body));
  }
  assert.equal((await call(tasks.POST(req("/api/future/tasks", { method: "POST", body: "{nope" })))).status, 400);
  assert.equal((await call(tasks.POST(req("/api/future/tasks", { method: "POST", body: { title: "a".repeat(20_000), date: TODAY } })))).status, 413);

  const hostile = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  const saved = await addTask(hostile);
  assert.equal(saved.title, hostile);
});

test("an old export with only events still imports", async () => {
  const oldFile = {
    version: 1,
    exportedAt: "2026-11-01T00:00:00.000Z",
    events: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        title: "DBMS quiz",
        type: "quiz",
        date: "2026-12-01",
        priority: "normal",
        status: "upcoming",
        prep: [],
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-01T00:00:00.000Z",
      },
    ],
  };
  const result = await call(importer.POST(req("/api/future/import", { method: "POST", body: oldFile })));
  assert.deepEqual(result.body, { imported: 1 });
});

test("version 2 import brings back tasks, goals and notes; bad rows reject the whole file", async () => {
  const stamp = "2026-11-24T05:00:00.000Z";
  const file = {
    version: 2,
    events: [],
    tasks: [{ id: "22222222-2222-4222-8222-222222222222", title: "Imported task", date: TODAY, category: "health", priority: "normal", done: false, doneAt: null, order: 0, createdAt: stamp, updatedAt: stamp }],
    goals: [{ id: "33333333-3333-4333-8333-333333333333", weekStart: "2026-11-23", title: "Imported goal", done: false, doneAt: null, order: 0, createdAt: stamp, updatedAt: stamp }],
    notes: [{ date: "2026-11-23", text: "Imported line", updatedAt: stamp }],
  };
  assert.deepEqual((await call(importer.POST(req("/api/future/import", { method: "POST", body: file })))).body, { imported: 3 });
  assert.deepEqual((await listTasks()).map((item) => item.title), ["Imported task"]);

  const broken = { ...file, tasks: [{ ...file.tasks[0], id: "44444444-4444-4444-8444-444444444444", date: "2026-02-30" }] };
  fs.rmSync(path.join(dataDir, "future-tasks.json"));
  assert.equal((await call(importer.POST(req("/api/future/import", { method: "POST", body: broken })))).status, 400);
  assert.equal((await listTasks()).length, 0);
});
