/**
 * Guards the admin area. Pages without a valid session redirect to /admin/login;
 * API routes get 401. Route handlers re-verify the session themselves as well.
 * The private planner (/future) is different: without a session it's the site's ordinary 404,
 * so nothing reveals that it exists. Its page and handlers re-verify too.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

const FUTURE_PATH = /^\/(api\/)?future(\/|$)/;
/** No route lives here, so a rewrite to it renders exactly what any unknown URL does. */
export const FUTURE_HIDDEN_PATH = "/_future-not-found";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (FUTURE_PATH.test(pathname)) {
    const username = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!username) {
      return NextResponse.rewrite(new URL(FUTURE_HIDDEN_PATH, request.url));
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const isApi = pathname.startsWith("/api/");

  if (!PUBLIC_PATHS.has(pathname)) {
    const username = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!username) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/future", "/future/:path*", "/api/future/:path*"],
};
