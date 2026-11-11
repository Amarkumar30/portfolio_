/**
 * /api/future/events — list (GET) and create (POST) planner events. Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storeOrError } from "@/features/future/guard";
import { eventInputSchema, fieldErrors } from "@/features/future/schema";
import { newEvent } from "@/features/future/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { store, error } = storeOrError();
  if (error) return error;

  try {
    return json({ events: await store.list() });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function POST(request: NextRequest) {
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
    const event = newEvent(parsed.data);
    await store.putMany([event]);
    return json({ event }, 201);
  } catch (caught) {
    return storageFailed(caught);
  }
}
