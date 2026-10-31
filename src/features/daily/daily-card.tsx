/**
 * Server components for the Daily feature. Data is fetched on the server only, so visitors'
 * browsers never call third-party APIs and the card renders in the initial HTML (no layout shift).
 * - DailyCard: home page card with today's quote and joke.
 * - DailyJoke: today's joke for the 404 page (loaded from this site's /api/daily; see joke-loader).
 * Both render nothing when the feature is off or anything fails.
 */
import { DAILY_ENABLED } from "./config";
import { formatDailyDate } from "./date";
import { DailyErrorBoundary } from "./error-boundary";
import { getDaily } from "./get-daily";
import { JokeBox } from "./joke-box";
import { DailyJokeLoader } from "./joke-loader";

async function DailyCardContent() {
  const daily = await getDaily();
  if (!daily) return null;

  const { quote } = daily;

  return (
    <section aria-labelledby="daily-title" className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="daily-title" className="text-h3 font-semibold">
          Daily
        </h2>
        <p className="meta">
          Updated daily · <time dateTime={daily.date}>{formatDailyDate(daily.date)}</time>
        </p>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-0">
        <figure className="md:pr-8">
          <p className="eyebrow mb-3">Quote</p>
          <blockquote className="text-body text-foreground">
            <p>&ldquo;{quote.text}&rdquo;</p>
          </blockquote>
          <figcaption className="meta mt-3">— {quote.author}</figcaption>
          {quote.source === "zenquotes" ? (
            <p className="mt-4 text-caption text-subtle">
              Quotes by{" "}
              <a href="https://zenquotes.io/" target="_blank" rel="noopener noreferrer" className="link">
                ZenQuotes.io
              </a>
            </p>
          ) : null}
        </figure>

        <div className="border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <p className="eyebrow mb-3">Joke</p>
          <JokeBox joke={daily.joke} more={daily.moreJokes} />
        </div>
      </div>
    </section>
  );
}

export function DailyCard() {
  return (
    <DailyErrorBoundary>
      <DailyCardContent />
    </DailyErrorBoundary>
  );
}

export function DailyJoke() {
  if (!DAILY_ENABLED) return null;

  return (
    <DailyErrorBoundary>
      <DailyJokeLoader />
    </DailyErrorBoundary>
  );
}
