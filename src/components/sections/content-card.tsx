/**
 * ContentCard previews a project: label, title, summary, stack tags (up to 5, then "+N"), and an arrow.
 * The whole card is clickable; cards in a grid row stretch to equal heights.
 * Props: href, title, summary, optional label, optional tags.
 * Used in: home "Selected work" and the projects index.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const MAX_TAGS = 5;

interface ContentCardProps {
  href: string;
  title: string;
  summary: string;
  label?: string;
  tags?: string[];
}

export function ContentCard({ href, title, summary, label, tags = [] }: ContentCardProps) {
  const visible = tags.slice(0, MAX_TAGS);
  const hidden = tags.length - visible.length;

  return (
    <article className="card card-interactive group relative flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">{label}</p>
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-subtle transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>
      <h3 className="mt-3 text-h3 font-semibold">
        <Link href={href} className="after:absolute after:inset-0 after:rounded-card">
          {title}
        </Link>
      </h3>
      <p className="mt-2 text-small text-muted">{summary}</p>
      {visible.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-6" aria-label="Stack">
          {visible.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
          {hidden > 0 ? (
            <li className="tag" aria-label={`and ${hidden} more`}>
              +{hidden}
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
