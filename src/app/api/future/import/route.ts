/**
 * /api/future/import — loads an export file. Events are added, and ones with the same id are
 * replaced; nothing else is deleted. The whole file is validated before anything is written.
 * Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storeOrError } from "@/features/future/guard";
import { exportSchema } from "@/features/future/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { store, error } = storeOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.importBytes);
  if ("error" in body) return body.error;

  const parsed = exportSchema.safeParse(body.data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json({ error: `That isn't a valid export file (${issue.path.join(".") || "file"}: ${issue.message}).` }, 400);
  }

  try {
    await store.putMany(parsed.data.events);
    return json({ imported: parsed.data.events.length });
  } catch (caught) {
    return storageFailed(caught);
  }
}
