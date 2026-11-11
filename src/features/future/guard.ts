/**
 * Every /api/future handler starts here, on top of the proxy's own check.
 * - No valid session: a plain 404, so the API doesn't reveal that it exists.
 * - A write from another origin: 403 (the admin's same-origin check).
 * - Bodies are read as text and size-checked before parsing.
 * Server-only.
 */
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/admin/csrf";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";
import { PRIVATE_HEADERS } from "./config";
import { getFutureStore } from "./store";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...PRIVATE_HEADERS, ...headers } });
}

export function notFound() {
  return new NextResponse("Not Found", { status: 404, headers: PRIVATE_HEADERS });
}

/** Returns the response to send when the request may not go on, or null when it may. */
export async function guardFutureRequest(request: NextRequest) {
  const username = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!username) return notFound();

  const mutating = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (mutating && !isSameOrigin(request)) return json({ error: "Invalid origin" }, 403);

  return null;
}

/** The store, or a 503 that the page turns into "Storage isn't set up yet". */
export function storeOrError() {
  const store = getFutureStore();
  return store
    ? { store, error: null }
    : { store: null, error: json({ error: "Storage isn't set up yet — see SETUP_ADMIN.md." }, 503) };
}

/** Parses a JSON body no larger than `limit` bytes. */
export async function readJson(request: Request, limit: number): Promise<{ data: unknown } | { error: Response }> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > limit) return { error: json({ error: "That's too large." }, 413) };

  const body = await request.text();
  if (new TextEncoder().encode(body).length > limit) return { error: json({ error: "That's too large." }, 413) };

  try {
    return { data: JSON.parse(body) };
  } catch {
    return { error: json({ error: "Invalid JSON." }, 400) };
  }
}

export function storageFailed(error: unknown) {
  console.error("[future] storage error", error);
  return json({ error: "Couldn't reach storage. Try again in a moment." }, 502);
}
