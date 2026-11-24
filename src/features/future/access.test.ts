/**
 * Who can reach /future, through the proxy and through every API handler, and what the
 * local file store does with real requests. Storage is a temporary file, never .data/.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import * as one from "@/app/api/future/events/[id]/route";
import * as events from "@/app/api/future/events/route";
import * as exporter from "@/app/api/future/export/route";
import * as importer from "@/app/api/future/import/route";
import { createSessionToken } from "@/lib/admin/session";
import { FUTURE_HIDDEN_PATH, proxy } from "@/proxy";

// Every module here reads these when called, not when imported.
const SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.ADMIN_SESSION_SECRET = SECRET;
process.env.ADMIN_USERNAME = "tester";
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "future-test-"));
process.env.FUTURE_DATA_FILE = path.join(dataDir, "future.json");

const ORIGIN = "http://localhost:3000";
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

beforeEach(() => fs.rmSync(process.env.FUTURE_DATA_FILE!, { force: true }));
after(() => fs.rmSync(dataDir, { recursive: true, force: true }));

function req(pathname: string, { method = "GET", token = session as string | null, origin = ORIGIN as string | null, body = undefined as unknown } = {}) {
  const headers: Record<string, string> = { "x-forwarded-host": "localhost:3000", "content-type": "application/json" };
  if (token) headers.cookie = `admin_session=${token}`;
  if (origin) headers.origin = origin;
  return new NextRequest(`${ORIGIN}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const input = { title: "Secret DBMS exam", type: "exam", date: "2026-11-14", notes: "Room 204" };

async function create(token: string | null = session) {
  const response = await events.POST(req("/api/future/events", { method: "POST", body: input, token }));
  return { response, body: response.status === 201 ? ((await response.json()) as { event: { id: string } }) : null };
}

/** Every handler, called the way a browser would. */
function everyHandler(id: string, token: string | null, origin: string | null = ORIGIN) {
  return [
    ["GET events", () => events.GET(req("/api/future/events", { token, origin }))],
    ["POST events", () => events.POST(req("/api/future/events", { method: "POST", body: input, token, origin }))],
    ["PUT event", () => one.PUT(req(`/api/future/events/${id}`, { method: "PUT", body: input, token, origin }), params(id))],
    ["DELETE event", () => one.DELETE(req(`/api/future/events/${id}`, { method: "DELETE", token, origin }), params(id))],
    ["GET export", () => exporter.GET(req("/api/future/export", { token, origin }))],
    ["POST import", () => importer.POST(req("/api/future/import", { method: "POST", body: { version: 1, events: [] }, token, origin }))],
  ] as const;
}

test("proxy: logged out, forged or expired, /future is the ordinary 404", async () => {
  for (const token of [null, "not-a-jwt", forged, expired]) {
    for (const pathname of ["/future", "/future/anything", "/api/future/events", "/api/future/export"]) {
      const response = await proxy(req(pathname, { token }));
      const rewrite = response.headers.get("x-middleware-rewrite");

      assert.ok(rewrite?.endsWith(FUTURE_HIDDEN_PATH), `${pathname} with ${token?.slice(0, 8)}`);
      // Nothing that a normal unknown URL wouldn't have.
      assert.equal(response.headers.get("x-robots-tag"), null);
      assert.equal(response.headers.get("location"), null);
    }
  }
});

test("proxy: with a session, private and noindex headers", async () => {
  for (const pathname of ["/future", "/api/future/events"]) {
    const response = await proxy(req(pathname));

    assert.equal(response.headers.get("x-middleware-rewrite"), null);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  }
});

test("proxy: the admin still redirects to login as before", async () => {
  const response = await proxy(req("/admin", { token: null }));
  assert.equal(response.status, 307);
  assert.ok(response.headers.get("location")?.endsWith("/admin/login"));
});

test("API: logged out, forged or expired sessions get a 404 with no event data", async () => {
  const { body } = await create();
  assert.ok(body);

  for (const token of [null, forged, expired]) {
    for (const [name, call] of everyHandler(body.event.id, token)) {
      const response: Response = await call();
      const text = await response.text();

      assert.equal(response.status, 404, name);
      assert.ok(!text.includes("Secret DBMS exam"), name);
    }
  }

  // Nothing was changed or deleted along the way.
  const list = (await (await events.GET(req("/api/future/events"))).json()) as { events: { title: string }[] };
  assert.deepEqual(list.events.map((event) => event.title), ["Secret DBMS exam"]);
});

test("API: cross-origin writes are rejected even with a valid session", async () => {
  const { body } = await create();
  assert.ok(body);

  for (const origin of ["https://evil.example", null]) {
    for (const [name, call] of everyHandler(body.event.id, session, origin)) {
      if (name.startsWith("GET")) continue;
      assert.equal((await call()).status, 403, `${name} from ${origin}`);
    }
  }

  const list = (await (await events.GET(req("/api/future/events"))).json()) as { events: unknown[] };
  assert.equal(list.events.length, 1);
});

test("API: responses are private and never indexed", async () => {
  const response = await events.GET(req("/api/future/events"));
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("local file store: create, edit, mark done, delete", async () => {
  const { response, body } = await create();
  assert.equal(response.status, 201);
  const id = body!.event.id;

  const edited = await one.PUT(req(`/api/future/events/${id}`, { method: "PUT", body: { ...input, title: "DBMS end-sem", prep: [{ text: "Solve PYQs" }] } }), params(id));
  assert.equal(edited.status, 200);

  const done = await one.PUT(req(`/api/future/events/${id}`, { method: "PUT", body: { ...input, status: "done" } }), params(id));
  const doneEvent = ((await done.json()) as { event: { status: string; createdAt: string; updatedAt: string } }).event;
  assert.equal(doneEvent.status, "done");
  assert.ok(doneEvent.updatedAt >= doneEvent.createdAt);

  const stored = JSON.parse(fs.readFileSync(process.env.FUTURE_DATA_FILE!, "utf8"));
  assert.equal(stored[id].status, "done");

  assert.equal((await one.DELETE(req(`/api/future/events/${id}`, { method: "DELETE" }), params(id))).status, 200);
  assert.equal((await one.DELETE(req(`/api/future/events/${id}`, { method: "DELETE" }), params(id))).status, 404);
  assert.equal((await one.PUT(req(`/api/future/events/${id}`, { method: "PUT", body: input }), params(id))).status, 404);
});

test("invalid and oversized writes are refused with field messages", async () => {
  const bad = await events.POST(req("/api/future/events", { method: "POST", body: { ...input, date: "2026-02-30", link: "javascript:alert(1)" } }));
  const body = (await bad.json()) as { fields: Record<string, string> };
  assert.equal(bad.status, 400);
  assert.ok(body.fields.date);
  assert.ok(body.fields.link);

  const huge = await events.POST(req("/api/future/events", { method: "POST", body: { ...input, notes: "a".repeat(20_000) } }));
  assert.equal(huge.status, 413);

  const notJson = await events.POST(req("/api/future/events", { method: "POST", body: "{nope" }));
  assert.equal(notJson.status, 400);
});

test("export then import gives back the same events", async () => {
  await create();
  await events.POST(req("/api/future/events", { method: "POST", body: { ...input, title: "Interview", type: "interview", date: "2026-11-20" } }));

  const exported = await exporter.GET(req("/api/future/export"));
  assert.match(exported.headers.get("content-disposition") ?? "", /attachment; filename="future-events-\d{4}-\d{2}-\d{2}\.json"/);
  const file = await exported.text();

  fs.rmSync(process.env.FUTURE_DATA_FILE!);
  const imported = await importer.POST(req("/api/future/import", { method: "POST", body: file }));
  assert.deepEqual(await imported.json(), { imported: 2 });

  const again = await (await exporter.GET(req("/api/future/export"))).json();
  assert.deepEqual(again.events, JSON.parse(file).events);
});

test("import rejects a bad file without writing anything", async () => {
  const bad = { version: 1, events: [{ id: "event-0001", title: "x", date: "2026-02-30", createdAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z" }] };

  for (const body of [bad, { events: [] }, [1, 2, 3]]) {
    assert.equal((await importer.POST(req("/api/future/import", { method: "POST", body }))).status, 400);
  }
  assert.ok(!fs.existsSync(process.env.FUTURE_DATA_FILE!));
});
