import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin/csrf";
import { HINT_COOKIE, SESSION_COOKIE } from "@/lib/admin/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(HINT_COOKIE);
  return response;
}
