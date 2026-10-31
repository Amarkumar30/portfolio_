"use client";

/**
 * TableOfContents: sticky list of a post's h2 sections that highlights the one being read.
 * Shown on wide screens only, for posts with three or more sections.
 * Props: headings (id + text) taken from the MDX source.
 * Used in: ReadingLayout.
 */
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";
import { cn } from "@/lib/utils";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      // The current section is the last heading that has scrolled past the top quarter.
      const line = window.innerHeight * 0.25;
      let current: string | null = null;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= line) current = heading.id;
      }

      setActive(current);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, [headings]);

  return (
    <nav aria-label="On this page" className="text-small">
      <p className="eyebrow mb-3">On this page</p>
      <ul className="space-y-1 border-l">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l border-transparent py-1 pl-4 text-subtle transition-colors duration-150 hover:text-foreground",
                active === heading.id && "border-accent text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
