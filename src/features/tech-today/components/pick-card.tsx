/**
 * PickCard: "Amar's pick", pinned above the list. The headline opens the reading page; the source
 * link goes straight to the article.
 */
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { TECH_TODAY_PATH } from "../config";
import type { TechPick } from "../types";
import { ExternalLink } from "./external-link";

export function PickCard({ pick }: { pick: TechPick }) {
  return (
    <Reveal>
      <section aria-labelledby="pick-title" className="card border-accent p-6">
        <p className="eyebrow">Amar&apos;s pick</p>
        <h2 id="pick-title" className="mt-2 text-h3 font-semibold break-words">
          <Link
            href={`${TECH_TODAY_PATH}/${pick.slug}`}
            className="transition-colors duration-150 hover:text-accent"
          >
            {pick.title}
          </Link>
        </h2>
        <p className="mt-2 text-body text-muted">{pick.note}</p>
        <ExternalLink
          href={pick.url}
          className="link mt-3 inline-flex min-h-11 items-center gap-1.5 text-small"
        >
          Read on {pick.source}
        </ExternalLink>
      </section>
    </Reveal>
  );
}
