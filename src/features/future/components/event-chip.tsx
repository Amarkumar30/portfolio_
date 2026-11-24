/**
 * EventChip: a small, read-only line for an event (type, time, title), used where events sit next
 * to tasks in Today, Week and Calendar.
 */
import { cn } from "@/lib/utils";
import type { FutureEvent } from "../schema";
import { TYPE_META } from "./type-meta";

/** Upcoming or done events that fall on `date`, multi-day ones included; all-day first. */
export function eventsOn(events: FutureEvent[], date: string) {
  return events
    .filter((event) => event.status !== "skipped" && event.date <= date && (event.endDate ?? event.date) >= date)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "") || a.title.localeCompare(b.title));
}

export function EventChip({ event, compact = false }: { event: FutureEvent; compact?: boolean }) {
  const meta = TYPE_META[event.type];
  const Icon = meta.icon;

  return (
    <span className={cn("flex min-w-0 items-start gap-2", compact ? "text-caption" : "text-small", event.status === "done" && "opacity-70")}>
      <Icon aria-hidden="true" className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", meta.className)} />
      <span className="min-w-0 break-words">
        <span className={cn("font-medium", meta.className)}>{meta.label}</span>
        {event.time ? <span className="meta"> · {event.time}</span> : null}
        <span className={cn("text-foreground", event.status === "done" && "line-through")}> · {event.title}</span>
      </span>
    </span>
  );
}
