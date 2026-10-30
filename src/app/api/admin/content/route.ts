import { NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin/handle-error";
import { guardAdminRequest } from "@/lib/admin/auth";
import { listEntries } from "@/lib/admin/content-service";
import { isSectionId } from "@/lib/content/sections";

export async function GET(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const section = new URL(request.url).searchParams.get("section");

  if (section !== null && !isSectionId(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  try {
    return NextResponse.json({ entries: await listEntries(section ?? undefined) });
  } catch (error) {
    return handleAdminError(error);
  }
}
