/**
 * JourneySection: the "How I got here" timeline on the About page.
 * Loads milestones on the server and renders every story into the HTML (collapsed until opened),
 * so search engines and screen readers can read them and nothing shifts on load.
 * The most recent milestone (other than Now) starts open.
 * Used in: /about, between the story and the skills list.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JourneyTimeline, type TimelineItem } from "@/components/journey/journey-timeline";
import { SectionHeading } from "@/components/ui/section-heading";
import { getJourney, type Milestone } from "@/lib/journey";
import { renderMdx } from "@/lib/mdx";

function MilestoneLink({ href, label }: { href: string; label: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className="text-link text-accent">
      {label}
      <ArrowRight aria-hidden="true" />
    </Link>
  ) : (
    <a href={href} className="text-link text-accent" target="_blank" rel="noopener noreferrer">
      {label}
      <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

async function Story({ milestone }: { milestone: Milestone }) {
  const body = milestone.body.trim() ? await renderMdx(milestone.body) : null;
  const nowBody = milestone.nowBody?.trim() ? await renderMdx(milestone.nowBody) : null;
  const links = milestone.isNow
    ? [...milestone.links, { label: "What I'm doing now", href: "/now" }]
    : milestone.links;

  return (
    <div className="space-y-4">
      {body ? <div className="rich-text">{body}</div> : null}
      {nowBody ? <div className="rich-text">{nowBody}</div> : null}
      {milestone.image ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-card border bg-surface-muted">
          <Image
            src={milestone.image}
            alt={milestone.imageAlt ?? ""}
            fill
            loading="lazy"
            sizes="(min-width: 768px) 640px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      {links.length > 0 ? (
        <ul className="flex flex-wrap gap-x-5">
          {links.map((link) => (
            <li key={link.href}>
              <MilestoneLink {...link} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function JourneySection() {
  const milestones = getJourney();
  if (milestones.length === 0) return null;

  const items: TimelineItem[] = milestones.map((milestone) => ({
    slug: milestone.slug,
    title: milestone.title,
    dateLabel: milestone.dateLabel,
    summary: milestone.summary,
    kind: milestone.kind,
    highlight: milestone.highlight,
    isNow: milestone.isNow,
    story: <Story milestone={milestone} />,
  }));

  const latest = milestones.filter((milestone) => !milestone.isNow).at(-1);

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-[calc(var(--header-height)+1.5rem)]">
      <JourneyTimeline
        items={items}
        defaultOpen={latest ? [latest.slug] : []}
        heading={
          <SectionHeading
            id="journey-title"
            eyebrow="Journey"
            title="How I got here"
            description="The milestones that shaped how I build — click any one for the story."
          />
        }
      />
    </section>
  );
}
