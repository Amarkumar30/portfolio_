/**
 * /api/future/events/[id] — replace (PUT) or delete (DELETE) one planner event. Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storeOrError } from "@/features/future/guard";
import { eventInputSchema, fieldErrors } from "@/features/future/schema";
import { updatedEvent } from "@/features/future/store";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { store, error } = storeOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes);
  if ("error" in body) return body.error;

  const parsed = eventInputSchema.safeParse(body.data);
  if (!parsed.success) {
    return json({ error: "Some fields need attention.", fields: fieldErrors(parsed.error) }, 400);
  }

  try {
    const existing = await store.get((await params).id);
    if (!existing) return json({ error: "That event no longer exists." }, 404);

    const event = updatedEvent(existing, parsed.data);
    await store.putMany([event]);
    return json({ event });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { store, error } = storeOrError();
  if (error) return error;

  try {
    const removed = await store.remove((await params).id);
    return removed ? json({ ok: true }) : json({ error: "That event no longer exists." }, 404);
  } catch (caught) {
    return storageFailed(caught);
  }
}
