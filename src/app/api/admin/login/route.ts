import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/admin/auth";
import { isSameOrigin } from "@/lib/admin/csrf";
import { clearFailures, clientIp, recordFailure, retryAfter } from "@/lib/admin/rate-limit";
import {
  HINT_COOKIE,
  SESSION_COOKIE,
  createSessionToken,
  hintCookieOptions,
  sessionCookieOptions,
} from "@/lib/admin/session";

const invalid = () => NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const ip = clientIp(request);
  const wait = retryAfter(ip);

  if (wait > 0) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return invalid();
  }

  const username = typeof body.username === "string" ? body.username.slice(0, 200) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";

  if (!(await verifyCredentials(username, password))) {
    recordFailure(ip);
    return invalid();
  }

  clearFailures(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(username), sessionCookieOptions);
  response.cookies.set(HINT_COOKIE, "1", hintCookieOptions);
  return response;
}
