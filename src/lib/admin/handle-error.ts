import { NextResponse } from "next/server";
import { ContentError } from "@/lib/admin/content-service";
import { StorageNotConfiguredError } from "@/lib/admin/storage";

export function handleAdminError(error: unknown) {
  if (error instanceof ContentError) {
    return NextResponse.json({ error: error.message, issues: error.issues }, { status: error.status });
  }

  if (error instanceof StorageNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  console.error("[admin]", error);
  return NextResponse.json(
    { error: "Something went wrong while talking to GitHub. Check the server logs." },
    { status: 502 },
  );
}
