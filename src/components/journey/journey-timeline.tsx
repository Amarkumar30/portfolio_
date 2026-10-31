"use client";

/**
 * JourneyTimeline: the interactive part of the About page timeline.
 * Everything is server-rendered (stories are in the HTML, just collapsed); this component only
 * tracks which milestones are open.
 * - The whole row is the toggle; several milestones can be open at once; "Expand all / Collapse all".
 * - Opening a milestone sets the URL hash (#journey-<slug>) without adding a history entry, and
 *   /about#journey-<slug> opens and scrolls to that milestone.
 * - Height animates with grid-template-rows 0fr → 1fr, the story fades up 8px; both are instant
 *   with reduced motion (global rule in globals.css).
 * Props: milestone headers and pre-rendered stories, which slugs start open, and the heading.
 * Used in: JourneySection on /about.
 */
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { journeyKindIcons } from "@/components/journey/kind-icons";
import type { JourneyKind } from "@/lib/content/sections";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  slug: string;
  title: string;
  dateLabel?: string;
  summary: string;
  kind: JourneyKind;
  highlight: boolean;
  isNow: boolean;
  story: React.ReactNode;
}

interface JourneyTimelineProps {
  items: TimelineItem[];
  defaultOpen: string[];
  heading: React.ReactNode;
}

const HASH_PREFIX = "journey-";

export function JourneyTimeline({ items, defaultOpen, heading }: JourneyTimelineProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const allOpen = items.every((item) => open.has(item.slug));

  const openFromHash = useCallback(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash.startsWith(HASH_PREFIX)) return;

    const slug = hash.slice(HASH_PREFIX.length);
    if (!items.some((item) => item.slug === slug)) return;

    setOpen((current) => (current.has(slug) ? current : new Set(current).add(slug)));
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
  }, [items]);

  useEffect(() => {
    // Deferred a frame so the open state lands after hydration.
    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [openFromHash]);

  function toggle(slug: string) {
    const opening = !open.has(slug);
    setOpen((current) => {
      const next = new Set(current);
      if (opening) next.add(slug);
      else next.delete(slug);
      return next;
    });

    if (opening) {
      // Shareable link to this milestone, without a new history entry.
      window.history.replaceState(window.history.state, "", `#${HASH_PREFIX}${slug}`);
    }
  }

  function toggleAll() {
    setOpen(allOpen ? new Set() : new Set(items.map((item) => item.slug)));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        {heading}
        <button type="button" onClick={toggleAll} className="btn btn-ghost -ml-3 shrink-0 sm:ml-0 sm:-mr-3">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol className="relative mt-8">
        {/* The vertical line, centred on the 10px dots. */}
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[4.5px] w-px bg-border" />

        {items.map((item, index) => {
          const isOpen = open.has(item.slug);
          const Icon = journeyKindIcons[item.kind];
          const buttonId = `${HASH_PREFIX}${item.slug}-toggle`;
          const storyId = `${HASH_PREFIX}${item.slug}-story`;

          return (
            <li
              key={item.slug}
              id={`${HASH_PREFIX}${item.slug}`}
              className="relative scroll-mt-[calc(var(--header-height)+1.5rem)] pl-8"
            >
              <span
                aria-hidden="true"
                // The reveal script adds data-visible before hydration.
                suppressHydrationWarning
                style={{ "--reveal-delay": `${index * 40}ms` } as React.CSSProperties}
                className={cn(
                  "reveal absolute top-4 left-0 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                  item.isNow
                    ? "border-2 border-accent bg-background"
                    : item.highlight
                      ? "bg-accent"
                      : "bg-border-strong",
                )}
              />
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggle(item.slug)}
                  aria-expanded={isOpen}
                  aria-controls={storyId}
                  className="group flex min-h-11 w-full items-start gap-4 rounded-control py-2.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="meta flex min-h-5 items-center gap-2">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {item.dateLabel ? <span className="tabular">{item.dateLabel}</span> : null}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-h3 font-semibold transition-colors duration-150",
                        item.highlight ? "text-accent" : "text-foreground group-hover:text-accent",
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="mt-1 block text-body text-pretty text-muted">{item.summary}</span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-subtle transition-transform duration-200 ease-out",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </h3>
              <div
                id={storyId}
                role="region"
                aria-labelledby={buttonId}
                inert={!isOpen}
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "pt-2 pb-6 transition-[opacity,transform] duration-200 ease-out",
                      isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    )}
                  >
                    {item.story}
                  </div>
                </div>
              </div>
              {!isOpen ? <div className="h-3" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
