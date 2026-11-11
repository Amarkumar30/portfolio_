"use client";

/**
 * Planner: the whole /future page once the server has checked the session.
 * Next up, stats, filters, the grouped timeline and completed events, worked out from the events
 * and a clock that ticks every 30 seconds. Changes show at once and roll back with a toast if the
 * server refuses them. Notes and every other field render as plain text.
 * Props: the events from storage and the server's current time (so the first render matches).
 */
import {
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Flag,
  Pencil,
  Plus,
  Search,
  SkipForward,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";
import { dateRange, dayOfMonth, istDate, longDate, shortMonth } from "../dates";
import { toInput, type EventInput, type FutureEvent, type Status } from "../schema";
import {
  FILTERS,
  completedEvents,
  countdown,
  groupEvents,
  isSoon,
  matchesFilter,
  nextUp,
  stats,
  type FilterId,
} from "../timeline";
import { EventForm } from "./event-form";
import { TYPE_META } from "./type-meta";

const PENDING = "pending-";
const TICK_MS = 30_000;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  } catch {
    throw new Error("You're offline, or the site can't be reached.");
  }

  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (response.ok && body) return body as T;
  // Without a session the API is a plain 404 page, not JSON.
  if (response.status === 404 && !body) throw new Error("Your session has expired. Log in again.");
  throw new Error(body?.error ?? `Something went wrong (${response.status}).`);
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function TypeLabel({ event }: { event: FutureEvent }) {
  const meta = TYPE_META[event.type];
  const Icon = meta.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-caption font-medium", meta.className)}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

/** "DBMS · 10:00 · Room 204", with a date range for multi-day events. */
function details(event: FutureEvent) {
  return [
    event.endDate ? dateRange(event.date, event.endDate) : null,
    event.course,
    event.time,
    event.location,
  ]
    .filter(Boolean)
    .join(" · ");
}

function prepProgress(event: FutureEvent) {
  const done = event.prep.filter((item) => item.done).length;
  return event.prep.length > 0 ? `${done}/${event.prep.length} prep done` : "";
}

export function Planner({ initialEvents, initialNow }: { initialEvents: FutureEvent[]; initialNow: number }) {
  const toast = useToast();
  const [events, setEvents] = useState(initialEvents);
  const [now, setNow] = useState(initialNow);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState<{ open: boolean; event: FutureEvent | null }>({ open: false, event: null });
  const [deleting, setDeleting] = useState<FutureEvent | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const openNew = useCallback(() => setForm({ open: true, event: null }), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "n" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      openNew();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNew]);

  const today = istDate(now);
  const visible = useMemo(
    () => events.filter((event) => matchesFilter(event, filter, query)),
    [events, filter, query],
  );
  const groups = useMemo(() => groupEvents(visible, now), [visible, now]);
  const completed = useMemo(() => completedEvents(visible), [visible]);
  const next = useMemo(() => nextUp(events, now), [events, now]);
  const counts = useMemo(() => stats(events, now), [events, now]);

  function fail(error: unknown) {
    toast({ kind: "error", message: error instanceof Error ? error.message : "Something went wrong." });
  }

  async function save(input: EventInput) {
    const editing = form.event;
    setForm({ open: false, event: null });
    const stamp = new Date().toISOString();

    if (editing) {
      await update(editing, input);
      return;
    }

    const draft: FutureEvent = { ...input, id: `${PENDING}${crypto.randomUUID()}`, createdAt: stamp, updatedAt: stamp };
    setEvents((list) => [...list, draft]);

    try {
      const { event } = await request<{ event: FutureEvent }>("/api/future/events", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setEvents((list) => list.map((item) => (item.id === draft.id ? event : item)));
    } catch (error) {
      setEvents((list) => list.filter((item) => item.id !== draft.id));
      fail(error);
    }
  }

  async function update(original: FutureEvent, input: EventInput) {
    setEvents((list) => list.map((item) => (item.id === original.id ? { ...item, ...input } : item)));

    try {
      const { event } = await request<{ event: FutureEvent }>(`/api/future/events/${original.id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
      setEvents((list) => list.map((item) => (item.id === event.id ? event : item)));
    } catch (error) {
      setEvents((list) => list.map((item) => (item.id === original.id ? original : item)));
      fail(error);
    }
  }

  function setStatus(event: FutureEvent, status: Status) {
    void update(event, { ...toInput(event), status });
  }

  function togglePrep(event: FutureEvent, index: number) {
    const prep = event.prep.map((item, position) => (position === index ? { ...item, done: !item.done } : item));
    void update(event, { ...toInput(event), prep });
  }

  async function remove(event: FutureEvent) {
    setDeleting(null);
    setEvents((list) => list.filter((item) => item.id !== event.id));

    try {
      await request(`/api/future/events/${event.id}`, { method: "DELETE" });
      toast({ kind: "success", message: `Deleted “${event.title}”` });
    } catch (error) {
      setEvents((list) => [...list, event]);
      fail(error);
    }
  }

  async function importFile(file: File) {
    try {
      const { imported } = await request<{ imported: number }>("/api/future/import", {
        method: "POST",
        body: await file.text(),
      });
      const { events: fresh } = await request<{ events: FutureEvent[] }>("/api/future/events");
      setEvents(fresh);
      toast({ kind: "success", message: `Imported ${imported} event${imported === 1 ? "" : "s"}.` });
    } catch (error) {
      fail(error);
    }
  }

  function row(event: FutureEvent) {
    const isOpen = expanded === event.id;
    const pending = event.id.startsWith(PENDING);
    const panelId = `event-${event.id}`;
    const progress = prepProgress(event);
    const left = countdown(event, now);

    return (
      <li key={event.id} className={cn("border-b", event.status !== "upcoming" && "opacity-75")}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setExpanded(isOpen ? null : event.id)}
          className="grid min-h-11 w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-3 py-3 text-left"
        >
          <time dateTime={event.date} className="flex flex-col items-center rounded-control border py-1 font-mono">
            <span className="text-body font-semibold leading-tight text-foreground">{dayOfMonth(event.date)}</span>
            <span className="text-caption uppercase text-subtle">{shortMonth(event.date)}</span>
          </time>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <TypeLabel event={event} />
              {event.priority === "high" ? (
                <span className="inline-flex items-center gap-1 text-caption font-medium text-danger">
                  <Flag aria-hidden="true" className="h-3.5 w-3.5" />
                  High
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-0.5 block font-medium break-words text-foreground",
                event.status === "done" && "line-through decoration-subtle",
              )}
            >
              {event.title}
            </span>
            {details(event) ? <span className="meta block break-words">{details(event)}</span> : null}
          </span>
          <span className="flex flex-col items-end gap-1 text-right">
            {left ? <span className="meta whitespace-nowrap text-foreground">{left}</span> : null}
            {event.status !== "upcoming" ? (
              <span className="meta capitalize">{event.status}</span>
            ) : progress ? (
              <span className="meta whitespace-nowrap">{progress}</span>
            ) : null}
            <ChevronDown
              aria-hidden="true"
              className={cn("h-4 w-4 text-subtle transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
            />
          </span>
        </button>

        {isOpen ? (
          <div id={panelId} className="space-y-4 pb-4 pl-[3.5rem]">
            {event.notes ? <p className="whitespace-pre-wrap break-words text-small text-muted">{event.notes}</p> : null}
            {event.link ? (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="link inline-flex min-h-11 items-center gap-1.5 break-all text-small"
              >
                {event.link}
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
            {event.prep.length > 0 ? (
              <fieldset>
                <legend className="eyebrow mb-1">Prep</legend>
                <ul>
                  {event.prep.map((item, index) => (
                    <li key={index}>
                      <label className="flex min-h-11 items-center gap-3 text-small">
                        <input
                          type="checkbox"
                          className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                          checked={item.done}
                          disabled={pending}
                          onChange={() => togglePrep(event, index)}
                        />
                        <span className={cn("break-words", item.done && "text-subtle line-through")}>{item.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => setForm({ open: true, event })}>
                <Pencil aria-hidden="true" />
                Edit
              </button>
              {event.status === "upcoming" ? (
                <>
                  <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => setStatus(event, "done")}>
                    <Check aria-hidden="true" />
                    Mark done
                  </button>
                  <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => setStatus(event, "skipped")}>
                    <SkipForward aria-hidden="true" />
                    Skip
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => setStatus(event, "upcoming")}>
                  <Undo2 aria-hidden="true" />
                  Back to upcoming
                </button>
              )}
              <button type="button" className="btn btn-ghost text-danger" disabled={pending} onClick={() => setDeleting(event)}>
                <Trash2 aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </li>
    );
  }

  const nothingYet = events.length === 0;
  const nothingMatches = !nothingYet && groups.length === 0 && completed.length === 0;

  return (
    <div className="max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 font-semibold">Future</h1>
          <p className="meta mt-2">
            <time dateTime={today}>{longDate(today)}</time> · IST
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn btn-primary" aria-keyshortcuts="N">
          <Plus aria-hidden="true" />
          Add event
        </button>
      </header>

      {next ? (
        <section
          aria-labelledby="next-up-title"
          className={cn("card mt-8 p-5 sm:p-6", isSoon(next, now) && "border-accent")}
        >
          <p id="next-up-title" className="eyebrow">
            Next up
          </p>
          <div className="mt-3">
            <TypeLabel event={next} />
          </div>
          <p className="mt-1 text-h3 font-semibold break-words">{next.title}</p>
          {details(next) ? <p className="meta mt-1">{details(next)}</p> : null}
          <p className="mt-3 text-body font-medium text-foreground">
            <time dateTime={next.time ? `${next.date}T${next.time}:00+05:30` : next.date}>
              {next.endDate ? dateRange(next.date, next.endDate) : longDate(next.date)}
              {next.time ? `, ${next.time}` : ""}
            </time>
            {" · "}
            {countdown(next, now)}
          </p>
        </section>
      ) : null}

      <dl className="mt-6 grid grid-cols-3 divide-x rounded-card border text-center">
        {[
          ["This week", counts.thisWeek],
          ["Exams", counts.exams],
          ["Overdue", counts.overdue],
        ].map(([label, value]) => (
          <div key={label} className="px-2 py-3">
            <dt className="meta">{label}</dt>
            <dd className={cn("mt-0.5 text-h3 font-semibold", label === "Overdue" && Number(value) > 0 && "text-danger")}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-3">
        <div role="group" aria-label="Filter by type" className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip shrink-0"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <label htmlFor="future-search" className="sr-only">
            Search events
          </label>
          <input
            id="future-search"
            type="search"
            className="field pl-9"
            placeholder="Search title, course or notes"
            value={query}
            onChange={(change) => setQuery(change.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        {nothingYet ? (
          <p className="border-y py-8 text-muted">Nothing planned yet. Add your first exam, quiz or plan.</p>
        ) : nothingMatches ? (
          <p className="border-y py-8 text-muted">Nothing matches that filter.</p>
        ) : null}

        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2
              id={`group-${group.id}`}
              className={cn(
                "eyebrow sticky top-header z-10 border-b bg-background py-2",
                group.id === "overdue" && "text-danger",
              )}
            >
              {group.label} <span className="font-normal">({group.events.length})</span>
            </h2>
            <ol>{group.events.map(row)}</ol>
          </section>
        ))}

        {completed.length > 0 ? (
          <section aria-label="Completed" className="mt-8">
            <button
              type="button"
              aria-expanded={showCompleted}
              aria-controls="completed-list"
              onClick={() => setShowCompleted((value) => !value)}
              className="btn btn-ghost -ml-3"
            >
              <ChevronDown
                aria-hidden="true"
                className={cn("transition-transform motion-reduce:transition-none", showCompleted && "rotate-180")}
              />
              {showCompleted ? "Hide" : "Show"} {completed.length} completed
            </button>
            {showCompleted ? (
              <ol id="completed-list" className="mt-2 border-t">
                {completed.map(row)}
              </ol>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className="mt-section flex flex-wrap items-center gap-2 border-t pt-6">
        <a href="/api/future/export" download className="btn btn-ghost -ml-3">
          <Download aria-hidden="true" />
          Export JSON
        </a>
        <button type="button" className="btn btn-ghost" onClick={() => importRef.current?.click()}>
          <Upload aria-hidden="true" />
          Import JSON
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(change) => {
            const file = change.target.files?.[0];
            change.target.value = "";
            if (file) void importFile(file);
          }}
        />
        <p className="meta w-full sm:ml-auto sm:w-auto">Press N to add an event</p>
      </div>

      <EventForm
        open={form.open}
        event={form.event}
        today={today}
        onSave={(input) => void save(input)}
        onClose={() => setForm({ open: false, event: null })}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete “${deleting?.title ?? ""}”?`}
        body="This can't be undone. Export first if you want a copy."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleting && void remove(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
