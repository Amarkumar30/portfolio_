"use client";

/**
 * FutureApp: the whole /future page once the server has checked the session.
 * The day's quote, a greeting with today's summary, then five tabs: Today · Week · Calendar ·
 * Events · Progress. The last tab is remembered in this browser. Keyboard: 1–5 switch tabs, N adds
 * a task (or an event, on the Events tab), Escape closes menus and panels.
 */
import { X } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { istDate, istHour, longDate } from "../dates";
import type { FutureEvent } from "../schema";
import { countDone, tasksOn } from "../tasks";
import { countdown, nextUp } from "../timeline";
import { CalendarView } from "./calendar-view";
import { EventsView } from "./planner";
import { ProgressView } from "./progress-view";
import { QuoteCard } from "./quote-card";
import { ADD_TASK_ID, TodayView } from "./today-view";
import { usePlanner, type InitialPlannerData, type Undo } from "./use-planner";
import { WeekView } from "./week-view";

const TICK_MS = 30_000;
const UNDO_MS = 6_000;
const STORAGE_KEY = "future-tab";

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "calendar", label: "Calendar" },
  { id: "events", label: "Events" },
  { id: "progress", label: "Progress" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function readStoredTab(): TabId | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return TABS.find((tab) => tab.id === value)?.id ?? null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function greeting(now: number) {
  const hour = istHour(now);
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function UndoBar({ undo, onClose }: { undo: Undo | null; onClose: () => void }) {
  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(onClose, UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo, onClose]);

  if (!undo) return null;

  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96">
      <div className="card flex items-center gap-3 p-3 pl-4 text-small shadow-lg shadow-black/5 motion-safe:animate-[toast-in_200ms_ease-out]">
        <p className="min-w-0 flex-1 break-words">{undo.message}</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            undo.restore();
            onClose();
          }}
        >
          Undo
        </button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Dismiss" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function FutureApp({
  initialEvents,
  initialNow,
  initialData,
}: {
  initialEvents: FutureEvent[];
  initialNow: number;
  initialData: InitialPlannerData;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [now, setNow] = useState(initialNow);
  const today = istDate(now);
  const planner = usePlanner(initialData, today);
  const stored = useSyncExternalStore(subscribe, readStoredTab, () => null);
  const [chosen, setChosen] = useState<TabId | null>(null);
  const tab = chosen ?? stored ?? "today";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const choose = useCallback((id: TabId) => {
    setChosen(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Private mode or storage off: the tab just isn't remembered.
    }
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (document.querySelector("dialog[open]")) return;

      const index = Number(event.key) - 1;
      if (index >= 0 && index < TABS.length) {
        event.preventDefault();
        choose(TABS[index].id);
        return;
      }

      // On Events, N opens the event form (handled there).
      if (event.key.toLowerCase() === "n" && tab !== "events") {
        event.preventDefault();
        choose("today");
        window.setTimeout(() => document.getElementById(ADD_TASK_ID)?.focus(), 0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, tab]);

  const todays = countDone(tasksOn(planner.tasks, today));
  const next = nextUp(events, now);
  const nextText = next ? countdown(next, now) : "";
  const summary = [
    todays.total > 0 ? `${todays.done} of ${todays.total} tasks done` : "No tasks yet today",
    next ? `Next: ${next.title}${nextText.startsWith("in ") ? " " : " · "}${nextText}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function onTabKey(event: React.KeyboardEvent, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const nextTab = TABS[(index + step + TABS.length) % TABS.length];
    choose(nextTab.id);
    document.getElementById(`future-tab-${nextTab.id}`)?.focus();
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-6">
        <QuoteCard date={today} />
        <div>
          <h1 className="text-h2 font-semibold">{greeting(now)}, Amar</h1>
          <p className="meta mt-1">
            <time dateTime={today}>{longDate(today)}</time> · IST
          </p>
          <p className="mt-2 text-small text-muted">{summary}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Planner" className="-mx-gutter flex gap-6 overflow-x-auto border-b px-gutter sm:mx-0 sm:px-0">
        {TABS.map((item, index) => (
          <button
            key={item.id}
            id={`future-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`future-panel-${item.id}`}
            aria-keyshortcuts={String(index + 1)}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => choose(item.id)}
            onKeyDown={(event) => onTabKey(event, index)}
            className={cn(
              "-mb-px inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap border-b border-transparent text-small font-medium text-muted transition-colors duration-150 hover:text-foreground",
              tab === item.id && "border-foreground text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id={`future-panel-${tab}`} role="tabpanel" aria-labelledby={`future-tab-${tab}`}>
        {tab === "today" ? <TodayView planner={planner} events={events} /> : null}
        {tab === "week" ? <WeekView planner={planner} events={events} /> : null}
        {tab === "calendar" ? <CalendarView planner={planner} events={events} /> : null}
        {tab === "events" ? <EventsView events={events} setEvents={setEvents} now={now} onImported={planner.reset} /> : null}
        {tab === "progress" ? <ProgressView planner={planner} /> : null}
      </div>

      <UndoBar undo={planner.undo} onClose={planner.dismissUndo} />
    </div>
  );
}
