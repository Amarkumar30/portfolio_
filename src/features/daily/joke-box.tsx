"use client";

/**
 * JokeBox shows a joke: the setup, then a "Reveal punchline" button (one-part jokes show at once).
 * The punchline fades up using the site's existing .reveal motion, inside an aria-live region.
 * "Another one" steps through pre-picked curated jokes on the client — no API calls — up to a limit.
 * Props: today's joke and the extra curated jokes (empty to hide "Another one").
 */
import { useId, useState } from "react";
import type { Joke } from "./types";

export function JokeBox({ joke, more = [] }: { joke: Joke; more?: Joke[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const punchlineId = useId();
  const jokes = [joke, ...more];
  const current = jokes[index];
  const exhausted = more.length > 0 && index >= more.length;

  function next() {
    setIndex((value) => value + 1);
    setRevealed(false);
  }

  return (
    <div>
      {current.kind === "single" ? (
        <p key={index} className="text-body text-foreground">
          {current.text}
        </p>
      ) : (
        <>
          <p key={index} className="text-body text-foreground">
            {current.setup}
          </p>
          <div id={punchlineId} aria-live="polite" className="mt-2">
            {revealed ? (
              <p key={index} className="reveal text-body font-medium text-foreground">
                {current.punchline}
              </p>
            ) : null}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {current.kind === "twopart" ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-expanded={revealed}
            aria-controls={punchlineId}
            className="btn btn-ghost -ml-3"
          >
            {revealed ? "Hide punchline" : "Reveal punchline"}
          </button>
        ) : null}
        {more.length > 0 ? (
          exhausted ? (
            <p className="text-small text-muted" role="status">
              That&apos;s enough fun for today 😄
            </p>
          ) : (current.kind === "single" || revealed) ? (
            <button type="button" onClick={next} className="btn btn-ghost -ml-3">
              Another one
            </button>
          ) : null
        ) : null}
      </div>
    </div>
  );
}
