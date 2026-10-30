import { NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin/handle-error";
import { guardAdminRequest } from "@/lib/admin/auth";
import { deleteEntry, readEntry, saveEntry, setDraft } from "@/lib/admin/content-service";
import { isSectionId } from "@/lib/content/sections";

interface Context {
  params: Promise<{ section: string; slug: string }>;
}

async function resolve(request: Request, context: Context) {
  const denied = await guardAdminRequest(request);
  if (denied) return { denied };

  const { section, slug } = await context.params;

  if (!isSectionId(section)) {
    return { denied: NextResponse.json({ error: "Unknown section" }, { status: 400 }) };
  }

  return { section, slug };
}

export async function GET(request: Request, context: Context) {
  const target = await resolve(request, context);
  if (target.denied) return target.denied;

  try {
    return NextResponse.json(await readEntry(target.section, target.slug));
  } catch (error) {
    return handleAdminError(error);
  }
}

/** Create or update. Body: { data, body, mode: "create" | "update", draft: boolean } */
export async function PUT(request: Request, context: Context) {
  const target = await resolve(request, context);
  if (target.denied) return target.denied;

  let payload: { data?: unknown; body?: unknown; mode?: unknown; draft?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof payload.data !== "object" ||
    payload.data === null ||
    Array.isArray(payload.data) ||
    typeof payload.body !== "string" ||
    (payload.mode !== "create" && payload.mode !== "update")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await saveEntry({
      section: target.section,
      slug: target.slug,
      data: payload.data as Record<string, unknown>,
      body: payload.body,
      mode: payload.mode,
      draft: payload.draft === true,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleAdminError(error);
  }
}

/** Publish / unpublish. Body: { draft: boolean } */
export async function PATCH(request: Request, context: Context) {
  const target = await resolve(request, context);
  if (target.denied) return target.denied;

  let payload: { draft?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload.draft !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    return NextResponse.json(await setDraft(target.section, target.slug, payload.draft));
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  const target = await resolve(request, context);
  if (target.denied) return target.denied;

  try {
    await deleteEntry(target.section, target.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAdminError(error);
  }
}
