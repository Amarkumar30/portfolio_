/**
 * /future — Amar's private planner. Without an admin session it's the site's ordinary 404 (the
 * proxy rewrites there first; this check is the second line). Never cached or prerendered, and
 * never linked from a public page: the only link is on the admin dashboard.
 * Used in: /future route.
 */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ToastProvider } from "@/components/admin/toast";
import { Planner } from "@/features/future/components/planner";
import { getFutureStore } from "@/features/future/store";
import type { FutureEvent } from "@/features/future/schema";
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

  const store = getFutureStore();
  let events: FutureEvent[] | null = null;

  if (store) {
    try {
      events = await store.list();
    } catch (error) {
      console.error("[future] couldn't load events", error);
    }
  }

  return (
    <div className="container-shell page">
      {!store ? (
        <Notice>Storage isn&apos;t set up yet — see SETUP_ADMIN.md.</Notice>
      ) : !events ? (
        <Notice>Couldn&apos;t reach storage. Refresh to try again.</Notice>
      ) : (
        <ToastProvider>
          <Planner initialEvents={events} initialNow={new Date().getTime()} />
        </ToastProvider>
      )}
    </div>
  );
}
