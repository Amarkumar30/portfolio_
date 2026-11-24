/**
 * FutureCard: the admin dashboard's link to the private planner, with today's tasks and what's next.
 * The only link to /future anywhere on the site, and only rendered for a logged-in admin.
 * Server component.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FUTURE_PATH } from "../config";
import { istDate } from "../dates";
import { getPlannerStores } from "../store";
import { countDone, tasksOn } from "../tasks";
import { countdown, nextUp } from "../timeline";

async function summary() {
  const stores = getPlannerStores();
  if (!stores) return ["Storage isn't set up yet — see SETUP_ADMIN.md."];

  try {
    const now = new Date().getTime();
    const [events, tasks] = await Promise.all([stores.events.list(), stores.tasks.list()]);
    const today = countDone(tasksOn(tasks, istDate(now)));
    const next = nextUp(events, now);

    return [
      today.total > 0 ? `Today: ${today.done}/${today.total} tasks done` : "Today: no tasks yet",
      next ? `Next: ${next.title} · ${countdown(next, now)}` : "Nothing planned yet.",
    ];
  } catch (error) {
    console.error("[future] couldn't load events for the dashboard", error);
    return ["Couldn't reach storage."];
  }
}

export async function FutureCard() {
  const lines = await summary();

  return (
    <Link
      href={FUTURE_PATH}
      className="card card-interactive group mb-8 flex items-center justify-between gap-4 p-5"
    >
      <span className="min-w-0">
        <span className="eyebrow block">Future · private planner</span>
        {lines.map((line) => (
          <span key={line} className="mt-1 block break-words font-medium text-foreground first-of-type:mt-1">
            {line}
          </span>
        ))}
      </span>
      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
    </Link>
  );
}
