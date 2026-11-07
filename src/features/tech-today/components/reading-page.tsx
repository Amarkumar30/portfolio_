/**
 * The Tech Today reading pages. These show only what publishers provide for sharing, clearly
 * attributed, and send readers to the original for the rest. Feed text renders as React text.
 * - StoryArticle: a story from the list.
 * - PickArticle: "Amar's pick", with his note first and his optional longer take.
 * - RotatedOut: for a story that's no longer in the list.
 */
import Link from "next/link";
import { buttonClass } from "@/components/ui/button-link";
import { formatDate } from "@/lib/format";
import { TECH_TODAY_PATH } from "../config";
import { formatIst } from "../format";
import type { Story, TechPick } from "../types";
import { ExternalLink } from "./external-link";
import { StoryList, storyTopic } from "./story-list";

/** .btn doesn't wrap, and a long domain in the label wouldn't fit on a phone. */
const wrappingButton = "h-auto min-h-11 w-full gap-2 whitespace-normal py-3 leading-snug sm:w-auto";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-shell page">
      <div className="max-w-3xl">
        <Link href={TECH_TODAY_PATH} className="text-link inline-flex min-h-11 items-center">
          ← Tech Today
        </Link>
        {children}
      </div>
    </div>
  );
}

export function StoryArticle({ story, more, now }: { story: Story; more: Story[]; now: Date }) {
  const publisher = story.publisher ?? story.source;

  return (
    <Shell>
      <article className="mt-6">
        <header>
          <p className="meta">
            {storyTopic(story)} · {story.source} ·{" "}
            <time dateTime={story.publishedAt}>{formatIst(story.publishedAt)} IST</time>
            {story.author ? ` · ${story.author}` : ""}
          </p>
          <h1 className="mt-3 text-h1 font-semibold break-words">{story.title}</h1>
        </header>

        {story.excerpt ? (
          <section aria-labelledby="summary-label" className="card mt-8 p-6">
            <p id="summary-label" className="eyebrow mb-3">
              Summary from {story.source}
            </p>
            <div className="rich-text">
              <p>{story.excerpt}</p>
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ExternalLink href={story.url} className={buttonClass("primary", wrappingButton)}>
            Read the full article on {publisher} →
          </ExternalLink>
          {story.discussionUrl ? (
            <ExternalLink href={story.discussionUrl} className={buttonClass("secondary", wrappingButton)}>
              Discuss on Hacker News
            </ExternalLink>
          ) : null}
        </div>
      </article>

      {more.length > 0 ? (
        <section aria-labelledby="more-title" className="mt-section">
          <h2 id="more-title" className="mb-6 text-h2 font-semibold">
            More from today
          </h2>
          <StoryList stories={more} now={now} heading="h3" />
        </section>
      ) : null}
    </Shell>
  );
}

export function PickArticle({
  pick,
  content,
  more,
  now,
}: {
  pick: TechPick;
  content: React.ReactNode;
  more: Story[];
  now: Date;
}) {
  return (
    <Shell>
      <article className="mt-6">
        <header>
          <p className="meta">
            Amar&apos;s pick · {pick.source} · <time dateTime={pick.date}>{formatDate(pick.date)}</time>
          </p>
          <h1 className="mt-3 text-h1 font-semibold break-words">{pick.title}</h1>
        </header>

        <section aria-labelledby="note-label" className="card mt-8 border-accent p-6">
          <p id="note-label" className="eyebrow mb-3">
            Amar&apos;s note
          </p>
          <div className="rich-text">
            <p>{pick.note}</p>
          </div>
        </section>

        {content ? <div className="rich-text mt-8">{content}</div> : null}

        <div className="mt-8">
          <ExternalLink href={pick.url} className={buttonClass("primary", wrappingButton)}>
            Read the full article on {pick.source} →
          </ExternalLink>
        </div>
      </article>

      {more.length > 0 ? (
        <section aria-labelledby="more-title" className="mt-section">
          <h2 id="more-title" className="mb-6 text-h2 font-semibold">
            More from today
          </h2>
          <StoryList stories={more} now={now} heading="h3" />
        </section>
      ) : null}
    </Shell>
  );
}

export function RotatedOut() {
  return (
    <Shell>
      <h1 className="mt-6 text-h1 font-semibold">This story has rotated out of today&apos;s list.</h1>
      <p className="mt-4 text-muted">
        Tech Today only keeps the latest headlines.{" "}
        <Link href={TECH_TODAY_PATH} className="link">
          See what&apos;s on it now
        </Link>
        .
      </p>
    </Shell>
  );
}
