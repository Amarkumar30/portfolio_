"use client";

/**
 * QuoteCard: the day's quote (the same all day, new at midnight IST), from the local list.
 * "Another" steps through the list for the moment only; nothing is saved.
 */
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { THEME_LABELS, quoteFor } from "../quotes";

export function QuoteCard({ date }: { date: string }) {
  const [offset, setOffset] = useState(0);
  const quote = quoteFor(date, offset);

  return (
    <figure className="card border-l-2 border-l-accent p-5 sm:p-6">
      <p className="eyebrow">{offset === 0 ? "Today's quote" : "Another quote"} · {THEME_LABELS[quote.theme]}</p>
      <blockquote className="mt-3 text-lead text-foreground">
        <p>&ldquo;{quote.text}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="meta">
          — {quote.author}
          {quote.source ? `, ${quote.source}` : ""}
        </span>
        <button type="button" className="btn btn-ghost -mr-2" onClick={() => setOffset((value) => value + 1)}>
          <RefreshCw aria-hidden="true" />
          Another
        </button>
      </figcaption>
    </figure>
  );
}
