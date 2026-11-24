/**
 * /future — Amar's private planner. Without an admin session it's the site's ordinary 404 (the
 * proxy rewrites there first; this check is the second line). Never cached or prerendered, and
 * never linked from a public page: the only link is on the admin dashboard.
 * Loads what the first view needs (this week's tasks, goals and notes, plus anything unfinished);
 * the tabs fetch other weeks and months as they're opened.
 * Used in: /future route.
 */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ToastProvider } from "@/components/admin/toast";
import { FutureApp } from "@/features/future/components/future-app";
import type { InitialPlannerData } from "@/features/future/components/use-planner";
import { addDays, istDate, startOfWeek } from "@/features/future/dates";
import type { FutureEvent } from "@/features/future/schema";
import { getPlannerStores } from "@/features/future/store";
import { inRange, rangeKey, unfinishedBefore } from "@/features/future/tasks";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Future",
  robots: { index: false, follow: false, nocache: true },
};

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-h1 font-semibold">Future</h1>
      <p className="card mt-8 p-6 text-muted">{children}</p>
    </div>
  );
}

export default async function FuturePage() {
  const username = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!username) notFound();

  const stores = getPlannerStores();
  const now = new Date().getTime();
  const today = istDate(now);
  const monday = startOfWeek(today);
  const sunday = addDays(monday, 6);

  let loaded: { events: FutureEvent[]; data: InitialPlannerData } | null = null;

  if (stores) {
    try {
      const [events, tasks, goals, notes] = await Promise.all([
        stores.events.list(),
        stores.tasks.list(),
        stores.goals.list(),
        stores.notes.list(),
      ]);
      const week = tasks.filter((task) => inRange(task.date, monday, sunday));
      const earlier = unfinishedBefore(tasks, today);

      loaded = {
        events,
        data: {
          tasks: [...week, ...earlier.filter((task) => !week.includes(task))],
          goals: goals.filter((goal) => goal.weekStart === monday),
          notes: notes.filter((note) => inRange(note.date, monday, sunday)),
          loaded: [
            rangeKey.tasks(monday, sunday),
            rangeKey.unfinished(today),
            rangeKey.goals(monday),
            rangeKey.notes(monday, sunday),
          ],
        },
      };
    } catch (error) {
      console.error("[future] couldn't load the planner", error);
    }
  }

  return (
    <div className="container-shell page">
      {!stores ? (
        <Notice>Storage isn&apos;t set up yet — see SETUP_ADMIN.md.</Notice>
      ) : !loaded ? (
        <Notice>Couldn&apos;t reach storage. Refresh to try again.</Notice>
      ) : (
        <ToastProvider>
          <FutureApp initialEvents={loaded.events} initialNow={now} initialData={loaded.data} />
        </ToastProvider>
      )}
    </div>
  );
}
