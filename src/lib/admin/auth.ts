/**
 * Admin authentication helpers for route handlers and server components.
 * Server-only.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin/csrf";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

// Compared against when the admin isn't configured, so a login attempt costs the same either way.
const DUMMY_HASH = "$2b$12$0NJb0lP5A/UV4OYkO6oOHuBldIbgTf33pZ2DO6C/0F0uwZjD8jR4.";

function sameString(a: string, b: string) {
  // Hash first so the comparison is constant-time regardless of input lengths.
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD_HASH &&
      (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32,
  );
}

export async function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const configured = isAdminConfigured();

  const usernameMatches = sameString(username, expectedUsername);
  const passwordMatches = await bcrypt.compare(password, configured ? passwordHash : DUMMY_HASH);

  return configured && usernameMatches && passwordMatches;
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }

  return null;
}

/**
 * Re-verifies the session (and Origin, for writes) inside an admin route handler.
 * Returns an error response to send, or null when the request may proceed.
 */
export async function guardAdminRequest(request: Request) {
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(request.method);

  if (mutating && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const username = await verifySessionToken(readCookie(request, SESSION_COOKIE));

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/** For admin server components: redirects to the login page without a valid session. */
export async function requireAdminPage() {
  const cookieStore = await cookies();
  const username = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!username) {
    redirect("/admin/login");
  }

  return username;
}
