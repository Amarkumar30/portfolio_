"use client";

/**
 * Progress: simple, honest numbers computed on the server (see progress.ts). A summary sentence,
 * four stat tiles, a 12-week activity heatmap, work by category, the best weekday, events done and
 * the last week's "one line about today" notes. Plain CSS, with text alternatives.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { longDate, monthDay } from "../dates";
import type { Progress } from "../progress";
import { request } from "./api-client";
import { CATEGORY_DOT } from "./category-meta";
import { TYPE_META } from "./type-meta";
import type { PlannerApi } from "./use-planner";

const LEVEL_CLASS = [
  "bg-surface-muted",
  "bg-accent/25",
  "bg-accent/45",
  "bg-accent/70",
  "bg-accent",
] as const;

function Tile({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "up" | "down" }) {
  return (
    <div className="card p-4">
      <dt className="meta">{label}</dt>
      <dd className={cn("mt-1 text-h2 font-semibold tabular", tone === "up" && "text-accent", tone === "down" && "text-danger")}>{value}</dd>
      {detail ? <dd className="meta mt-0.5">{detail}</dd> : null}
    </div>
  );
}

function Heatmap({ days }: { days: Progress["heatmap"] }) {
  const [picked, setPicked] = useState<Progress["heatmap"][number] | null>(null);
  const active = days.filter((day) => !day.future && day.count > 0);
  const total = active.reduce((sum, day) => sum + day.count, 0);
  const busiest = active.reduce<Progress["heatmap"][number] | null>((best, day) => (!best || day.count > best.count ? day : best), null);

  return (
    <section aria-labelledby="heatmap-title">
      <h3 id="heatmap-title" className="eyebrow">
        Last 12 weeks
      </h3>
      <p className="sr-only">
        {total} tasks done on {active.length} days.{busiest ? ` Busiest day: ${longDate(busiest.date)}, ${busiest.count} tasks.` : ""}
      </p>
      <div aria-hidden="true" className="mt-3 overflow-x-auto">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              tabIndex={-1}
              title={day.future ? longDate(day.date) : `${longDate(day.date)}: ${day.count} done`}
              onClick={() => setPicked(day)}
              className={cn(
                "h-5 w-5 rounded-[4px] sm:h-4 sm:w-4",
                day.future ? "bg-transparent" : day.count === 0 && day.planned === 0 ? "border bg-transparent" : LEVEL_CLASS[day.level],
                picked?.date === day.date && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
              )}
            />
          ))}
        </div>
      </div>
      <p className="meta mt-2 min-h-5" aria-live="polite">
        {picked
          ? `${longDate(picked.date)}: ${picked.count} done${picked.planned ? ` of ${picked.planned} planned` : ""}`
          : "Tap a square to see that day. Empty squares had nothing planned."}
      </p>
    </section>
  );
}

export function ProgressView({ planner }: { planner: PlannerApi }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [failed, setFailed] = useState(false);
  const { version, fail } = planner;

  useEffect(() => {
    let current = true;
    request<{ progress: Progress }>("/api/future/progress")
      .then((body) => {
        if (current) setProgress(body.progress);
      })
      .catch((error) => {
        if (!current) return;
        setFailed(true);
        fail(error);
      });
    return () => {
      current = false;
    };
  }, [version, fail]);

  if (failed && !progress) return <p className="max-w-3xl border-y py-8 text-muted">Progress couldn&apos;t load. Refresh to try again.</p>;
  if (!progress) {
    return (
      <div aria-busy="true" aria-label="Loading progress" className="max-w-3xl space-y-3">
        <div className="h-5 w-3/4 rounded bg-surface-muted" />
        <div className="h-24 rounded-card bg-surface-muted" />
      </div>
    );
  }

  if (!progress.enough) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-h2 font-semibold">Progress</h2>
        <p className="mt-6 border-y py-8 text-muted">Keep planning for a few days — your progress will show here.</p>
      </div>
    );
  }

  const change = progress.change;
  const maxCategory = Math.max(1, ...progress.categories.map((item) => item.count));

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="text-h2 font-semibold">Progress</h2>
        <p className="mt-3 text-lead text-foreground">{progress.summary}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          label="This week"
          value={progress.week.percent === null ? "—" : `${progress.week.percent}%`}
          detail={`${progress.week.done} of ${progress.week.total} tasks`}
        />
        <Tile
          label="vs last week"
          value={change === null ? "—" : change === 0 ? "Same" : `${change > 0 ? "▲" : "▼"} ${Math.abs(change)}`}
          detail={change === null ? "Not enough to compare" : "percentage points"}
          tone={change === null || change === 0 ? undefined : change > 0 ? "up" : "down"}
        />
        <Tile label="Current streak" value={`${progress.streak}`} detail={progress.streak === 1 ? "day" : "days"} />
        <Tile label="Best streak" value={`${progress.bestStreak}`} detail={progress.bestStreak === 1 ? "day" : "days"} />
      </dl>

      <Heatmap days={progress.heatmap} />

      <div className="grid gap-10 sm:grid-cols-2">
        <section aria-labelledby="category-title">
          <h3 id="category-title" className="eyebrow">
            By category · last 30 days
          </h3>
          {progress.categories.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {progress.categories.map((item) => (
                <li key={item.category} className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-2 text-small">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", CATEGORY_DOT[item.category])} />
                    {item.label}
                  </span>
                  <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(item.count / maxCategory) * 100}%` }} />
                  </span>
                  <span className="meta text-right tabular">
                    {item.count}
                    <span className="sr-only"> done</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-small text-muted">Nothing ticked in the last 30 days yet.</p>
          )}
        </section>

        <section aria-labelledby="weekday-title" className="space-y-6">
          <div>
            <h3 id="weekday-title" className="eyebrow">
              Best day of the week
            </h3>
            <p className="mt-2">
              {progress.bestWeekday ? (
                <>
                  <span className="font-semibold">{progress.bestWeekday.weekday}</span>
                  <span className="text-muted"> · {progress.bestWeekday.count} done in the last 8 weeks</span>
                </>
              ) : (
                <span className="text-muted">Not enough yet.</span>
              )}
            </p>
          </div>
          <div>
            <h3 className="eyebrow">Events done · last 30 days</h3>
            {progress.eventsDone.length > 0 ? (
              <ul className="mt-2 space-y-1 text-small">
                {progress.eventsDone.map((event) => (
                  <li key={`${event.date}-${event.title}`} className="break-words">
                    <span className={TYPE_META[event.type].className}>{TYPE_META[event.type].label}</span>
                    <span> · {event.title}</span>
                    <time dateTime={event.date} className="meta">
                      {" "}
                      · {monthDay(event.date)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-small text-muted">No exams, quizzes or interviews marked done yet.</p>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="lines-title">
        <h3 id="lines-title" className="eyebrow">
          Your lines
        </h3>
        {progress.lines.length > 0 ? (
          <ul className="mt-3 divide-y border-y">
            {progress.lines.map((line) => (
              <li key={line.date} className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <time dateTime={line.date} className="meta">
                  {monthDay(line.date)}
                </time>
                <p className="break-words text-small text-foreground">{line.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-small text-muted">Write one line at the bottom of Today and it shows up here.</p>
        )}
      </section>
    </div>
  );
}
