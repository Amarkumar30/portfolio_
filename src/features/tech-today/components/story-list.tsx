/**
 * StoryList: the rows on the Tech Today list and under "More from today". Server-rendered.
 * StoryMeta: topic · source · time, also used on the reading page's list.
 * Headlines are headings sized like h3, at whichever level fits the page's outline.
 */
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { TECH_TODAY_PATH } from "../config";
import { formatIst, relativeTime } from "../format";
import type { Story } from "../types";

/** The label shown on a story; general tech stories have no topic. */
export function storyTopic(story: Story) {
  return story.topics[0] ?? "Tech";
}

function RelativeTime({ iso, now }: { iso: string; now: Date }) {
  const { short, spoken } = relativeTime(iso, now);

  return (
    <time dateTime={iso} title={`${formatIst(iso)} IST`}>
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{spoken}</span>
    </time>
  );
}

function StoryMeta({ story, now }: { story: Story; now: Date }) {
  return (
    <p className="meta">
      {storyTopic(story)} · {story.source} · <RelativeTime iso={story.publishedAt} now={now} />
    </p>
  );
}

export function StoryList({
  stories,
  now,
  heading: Heading = "h2",
}: {
  stories: Story[];
  now: Date;
  heading?: "h2" | "h3";
}) {
  return (
    <ol className="border-t">
      {stories.map((story, index) => (
        <li key={story.id} className="border-b">
          <Reveal index={index}>
            <Link href={`${TECH_TODAY_PATH}/${story.id}`} className="group block py-4">
              <StoryMeta story={story} now={now} />
              <Heading className="mt-1 text-h3 font-semibold break-words text-foreground transition-colors duration-150 group-hover:text-accent">
                {story.title}
              </Heading>
              {story.excerpt ? (
                <p className="mt-1 line-clamp-2 text-small text-muted">{story.excerpt}</p>
              ) : null}
            </Link>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
