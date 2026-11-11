/**
 * FutureCard: the admin dashboard's link to the private planner, with what's next.
 * The only link to /future anywhere on the site, and only rendered for a logged-in admin.
 * Server component.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FUTURE_PATH } from "../config";
import { getFutureStore } from "../store";
import { countdown, nextUp } from "../timeline";

async function summary() {
  const store = getFutureStore();
  if (!store) return "Storage isn't set up yet — see SETUP_ADMIN.md.";

  try {
    const now = new Date().getTime();
    const next = nextUp(await store.list(), now);
    return next ? `Next: ${next.title} · ${countdown(next, now)}` : "Nothing planned yet.";
  } catch (error) {
    console.error("[future] couldn't load events for the dashboard", error);
    return "Couldn't reach storage.";
  }
}

export async function FutureCard() {
  return (
    <Link
      href={FUTURE_PATH}
      className="card card-interactive group mb-8 flex items-center justify-between gap-4 p-5"
    >
      <span className="min-w-0">
        <span className="eyebrow block">Future · private planner</span>
        <span className="mt-1 block break-words font-medium text-foreground">{await summary()}</span>
      </span>
      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
    </Link>
  );
}
