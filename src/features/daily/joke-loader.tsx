"use client";

/**
 * DailyJokeLoader: the 404 page's joke. The 404 page is shared by every route, so instead of
 * fetching on the server (which would put every page on the daily cache), it reads today's joke
 * from this site's own /api/daily. The card's height is reserved up front so nothing shifts.
 */
import { useEffect, useState } from "react";
import { JokeBox } from "./joke-box";
import type { Joke } from "./types";

export function DailyJokeLoader() {
  const [joke, setJoke] = useState<Joke | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/daily", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { joke?: Joke } | null) => setJoke(payload?.joke ?? null))
      .catch(() => {
        if (!controller.signal.aborted) setJoke(null);
      });
    return () => controller.abort();
  }, []);

  if (joke === null) return null;

  return (
    <aside aria-labelledby="daily-joke-title" aria-busy={joke === undefined} className="card min-h-48 p-6 text-left">
      <p id="daily-joke-title" className="eyebrow mb-3">
        While you&apos;re here…
      </p>
      {joke ? (
        <JokeBox joke={joke} />
      ) : (
        <div aria-hidden="true" className="space-y-2">
          <div className="h-4 w-4/5 rounded bg-surface-muted" />
          <div className="h-4 w-2/5 rounded bg-surface-muted" />
        </div>
      )}
    </aside>
  );
}
