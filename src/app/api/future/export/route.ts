/**
 * /api/future/export — every planner event as a JSON download. Admin session only.
 * The file has the same shape /api/future/import accepts.
 */
import type { NextRequest } from "next/server";
import { istDate } from "@/features/future/dates";
import { guardFutureRequest, json, storageFailed, storeOrError } from "@/features/future/guard";
import type { FutureExport } from "@/features/future/schema";
import { compareEvents } from "@/features/future/timeline";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { store, error } = storeOrError();
  if (error) return error;

  try {
    const now = new Date();
    const file: FutureExport = {
      version: 1,
      exportedAt: now.toISOString(),
      events: (await store.list()).sort(compareEvents),
    };

    return json(file, 200, {
      "Content-Disposition": `attachment; filename="future-events-${istDate(now.getTime())}.json"`,
    });
  } catch (caught) {
    return storageFailed(caught);
  }
}
