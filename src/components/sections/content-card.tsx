/**
 * ContentCard previews one piece of content (project, post, research write-up) and links to it.
 * Props: href, title, summary, optional eyebrow, optional meta line items, and a call-to-action label.
 * Used in: home, projects, writing and research index pages.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ContentCardProps {
  href: string;
  title: string;
  summary: string;
  eyebrow?: string;
  meta?: React.ReactNode[];
  cta?: string;
}

export function ContentCard({ href, title, summary, eyebrow, meta = [], cta }: ContentCardProps) {
  return (
    <article className="section-card group relative flex h-full flex-col p-6 hover:border-accent/50">
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h3 className="font-heading text-xl font-semibold tracking-tight">
        <Link href={href} className="after:absolute after:inset-0">
          {title}
        </Link>
      </h3>
      <p className="mt-3 text-base leading-7 text-muted">{summary}</p>
      {meta.length > 0 ? (
        <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-6 text-sm text-muted">
          {meta.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </p>
      ) : null}
      {cta ? (
        <p
          className={`${meta.length > 0 ? "pt-4" : "mt-auto pt-6"} inline-flex items-center gap-1.5 text-sm font-semibold text-accent`}
        >
          {cta}
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </p>
      ) : null}
    </article>
  );
}
