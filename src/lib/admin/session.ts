/**
 * Signed admin session tokens (HS256 JWT via jose). No Node-only APIs, so proxy.ts can use it too.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
/** Non-secret, readable by client JS; only used to decide whether to show the footer "Admin" link. */
export const HINT_COOKIE = "admin_hint";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const AUDIENCE = "portfolio-admin";

function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(username: string) {
  const key = getKey();

  if (!key) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters long.");
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);
}

/** Returns the session's username, or null when the token is missing, invalid, expired, or stale. */
export async function verifySessionToken(token: string | undefined | null) {
  const key = getKey();

  if (!token || !key) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      audience: AUDIENCE,
    });

    // Changing ADMIN_USERNAME invalidates existing sessions.
    return payload.sub && payload.sub === process.env.ADMIN_USERNAME ? payload.sub : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export const hintCookieOptions = {
  ...sessionCookieOptions,
  httpOnly: false,
};
