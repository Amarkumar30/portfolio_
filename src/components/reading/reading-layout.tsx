/**
 * Reading page building blocks shared by posts, research write-ups and case studies:
 * - ReadingLayout: a centred ~680px column, with an optional sticky table of contents in the
 *   right margin on wide screens and an optional reading-progress bar.
 * - ArticleHeader: back link, label, title, lead, and a mono meta row.
 * - ArticleFooter: previous/next links and a "Back to …" link.
 */
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReadingProgress } from "@/components/reading/reading-progress";
import { TableOfContents } from "@/components/reading/table-of-contents";
import type { Heading } from "@/lib/headings";
import { cn } from "@/lib/utils";

/** Posts with at least this many h2 sections get a table of contents. */
const TOC_MIN_HEADINGS = 3;

interface ReadingLayoutProps {
  children: React.ReactNode;
  headings?: Heading[];
  progress?: boolean;
}

export function ReadingLayout({ children, headings = [], progress = false }: ReadingLayoutProps) {
  const showToc = headings.length >= TOC_MIN_HEADINGS;

  return (
    <div className="container-shell page">
      {progress ? <ReadingProgress /> : null}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_42.5rem_minmax(0,1fr)] xl:gap-10">
        <article className="reading-column mx-auto xl:col-start-2">{children}</article>
        {showToc ? (
          <aside className="hidden xl:block">
            <div className="sticky top-[calc(var(--header-height)+3rem)] max-h-[calc(100vh-var(--header-height)-6rem)] overflow-y-auto">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

interface ArticleHeaderProps {
  back: { href: string; label: string };
  eyebrow?: React.ReactNode;
  title: string;
  lead?: string;
  meta?: React.ReactNode[];
  children?: React.ReactNode;
  className?: string;
}

export function ArticleHeader({ back, eyebrow, title, lead, meta = [], children, className }: ArticleHeaderProps) {
  return (
    <header className={cn("mb-10", className)}>
      <Link href={back.href} className="text-link -mt-2 mb-6 text-muted">
        <ArrowLeft aria-hidden="true" />
        {back.label}
      </Link>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h1 className="text-h1 font-semibold">{title}</h1>
      {lead ? <p className="mt-4 text-lead text-muted">{lead}</p> : null}
      {meta.length > 0 ? (
        <p className="meta mt-6 flex flex-wrap items-center gap-x-2 gap-y-1">
          {meta.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              {item}
            </span>
          ))}
        </p>
      ) : null}
      {children}
    </header>
  );
}

interface Neighbour {
  href: string;
  title: string;
}

interface ArticleFooterProps {
  previous?: Neighbour;
  next?: Neighbour;
  back: { href: string; label: string };
}

export function ArticleFooter({ previous, next, back }: ArticleFooterProps) {
  return (
    <footer className="mt-16 border-t pt-8">
      {previous || next ? (
        <nav aria-label="More" className="mb-8 grid gap-4 sm:grid-cols-2">
          {previous ? (
            <Link href={previous.href} className="card card-interactive group block p-4">
              <span className="meta flex items-center gap-1.5">
                <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                Previous
              </span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <Link href={next.href} className="card card-interactive group block p-4 sm:text-right">
              <span className="meta flex items-center gap-1.5 sm:justify-end">
                Next
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
      <Link href={back.href} className="text-link text-muted">
        <ArrowLeft aria-hidden="true" />
        {back.label}
      </Link>
    </footer>
  );
}
