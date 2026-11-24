/**
 * /api/future/notes/[date] — save the day's line (PUT { text }; empty text removes it) or delete it
 * (DELETE). Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { dateField, noteInputSchema } from "@/features/future/planner-schema";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ date: string }>;
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const date = dateField.safeParse((await params).date);
  if (!date.success) return json({ error: "That date isn't valid." }, 400);

  const body = await readJson(request, LIMITS.eventBytes);
  if ("error" in body) return body.error;
  const input = validate(noteInputSchema, body.data);
  if ("error" in input) return input.error;

  try {
    if (!input.data.text) {
      await stores.notes.remove(date.data);
      return json({ note: null });
    }

    const note = { date: date.data, text: input.data.text, updatedAt: new Date().toISOString() };
    await stores.notes.putMany([note]);
    return json({ note });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const date = dateField.safeParse((await params).date);
  if (!date.success) return json({ error: "That date isn't valid." }, 400);

  try {
    await stores.notes.remove(date.data);
    return json({ ok: true });
  } catch (caught) {
    return storageFailed(caught);
  }
}
