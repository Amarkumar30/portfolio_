/**
 * Home page: who Amar is, what he's building toward, selected work, writing and notes, and now.
 * Props: none for the route component.
 * Used in: / route entry point.
 */
import { ArrowRight, CodeXml, FlaskConical, Hammer } from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { ContentCard } from "@/components/sections/content-card";
import { EntryList } from "@/components/sections/entry-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Portrait } from "@/components/ui/portrait";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { DailyCard } from "@/features/daily";
import { getEntries, getSingle } from "@/lib/content/loader";
import { buildingToward, siteContent } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata, hasResume } from "@/lib/site";

// Re-render at most every 15 minutes so the Daily card switches soon after midnight IST.
// (Its API responses are cached for a whole day, so this doesn't add API calls.)
export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Amar Kumar is a software engineer building full-stack products and researching Generative Engine Optimization: how brands get found when AI answers the question.",
  path: "/",
});

const buildingIcons: Record<string, typeof CodeXml> = {
  Engineering: CodeXml,
  Research: FlaskConical,
  Building: Hammer,
};

function AllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export default async function HomePage() {
  const latestPosts = getEntries("blog").slice(0, 3);
  const recentNotes = getEntries("notes").slice(0, 3);
  const featuredProjects = getEntries("projects")
    .filter((project) => project.data.featured)
    .slice(0, 2);
  const now = getSingle("now");
  const nowContent = now ? await renderMdx(now.body) : null;

  return (
    <div className="container-shell page space-y-section">
      <PersonJsonLd />

      <section aria-labelledby="hero-title" className="max-w-3xl">
        <div className="flex items-center gap-4">
          <Portrait size={56} priority />
          <p className="flex items-center gap-2 text-small text-muted">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-accent ring-4 ring-accent-soft"
            />
            {siteContent.availability}
          </p>
        </div>
        <h1 id="hero-title" className="mt-8 text-display font-semibold">
          {siteContent.name}
        </h1>
        <p className="mt-4 text-lead text-foreground">{siteContent.tagline}</p>
        <div className="mt-6 max-w-[62ch] space-y-4 text-body text-muted">
          {siteContent.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/projects">View work</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Get in touch
          </ButtonLink>
          {hasResume ? (
            <ButtonLink href="/resume.pdf" variant="ghost">
              Resume
            </ButtonLink>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="building-title" className="space-y-8">
        <SectionHeading id="building-title" title={buildingToward.title} />
        <div className="grid gap-4 md:grid-cols-3">
          {buildingToward.items.map((item, index) => {
            const Icon = buildingIcons[item.label] ?? CodeXml;

            return (
              <Reveal key={item.label} index={index} className="card flex h-full flex-col p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-control border bg-surface-muted text-muted">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <p className="eyebrow mt-5">{item.label}</p>
                <h3 className="mt-1.5 text-h3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-small text-muted">{item.body}</p>
                {item.link ? (
                  <div className="mt-auto pt-4">
                    <AllLink href={item.link.href}>{item.link.label}</AllLink>
                  </div>
                ) : null}
              </Reveal>
            );
          })}
        </div>
        <p className="max-w-[62ch] text-lead text-muted">{buildingToward.closing}</p>
      </section>

      <section aria-labelledby="work-title" className="space-y-8">
        <SectionHeading
          id="work-title"
          title="Selected work"
          description="Each one started with a real workflow that wasn't working."
          action={<AllLink href="/projects">All projects</AllLink>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.slug} index={index}>
              <ContentCard
                href={`/projects/${project.slug}`}
                label={project.data.status ?? "Case study"}
                title={project.data.title}
                summary={project.data.summary}
                tags={project.data.stack}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {latestPosts.length > 0 || recentNotes.length > 0 ? (
        <div className="grid gap-section lg:grid-cols-2 lg:gap-12">
          {latestPosts.length > 0 ? (
            <section aria-labelledby="writing-title" className="space-y-6">
              <SectionHeading
                id="writing-title"
                title="Latest writing"
                action={<AllLink href="/blog">All writing</AllLink>}
              />
              <EntryList
                rows={latestPosts.map((post) => ({
                  href: `/blog/${post.slug}`,
                  title: post.data.title,
                  date: post.data.date,
                  trailing: post.readingTime,
                }))}
              />
            </section>
          ) : null}

          {recentNotes.length > 0 ? (
            <section aria-labelledby="notes-title" className="space-y-6">
              <SectionHeading
                id="notes-title"
                title="Recent notes"
                action={<AllLink href="/notes">All notes</AllLink>}
              />
              <EntryList
                rows={recentNotes.map((note) => ({
                  href: `/notes#${note.slug}`,
                  title: note.data.title,
                  date: note.data.date,
                  trailing: note.readingTime,
                }))}
              />
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="max-w-3xl space-y-4">
        {now ? (
          <section aria-labelledby="now-title" className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id="now-title" className="text-h3 font-semibold">
                Now
              </h2>
              <p className="meta">
                Updated <time dateTime={now.data.updated}>{formatDate(now.data.updated, "month")}</time>
              </p>
            </div>
            <div className="rich-text mt-4 text-small">{nowContent}</div>
            <div className="mt-4">
              <AllLink href="/now">More on what I&apos;m doing now</AllLink>
            </div>
          </section>
        ) : null}
        <DailyCard />
      </div>

      <section
        aria-labelledby="cta-title"
        className="flex flex-col gap-6 border-t pt-12 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-xl">
          <h2 id="cta-title" className="text-h2 font-semibold">
            Working on something similar?
          </h2>
          <p className="mt-2 text-muted">
            Hiring, building in AI search, or curious about GEO for Indian brands — I&apos;d like
            to hear about it.
          </p>
        </div>
        <ButtonLink href="/contact" className="self-start sm:self-auto">
          Get in touch
        </ButtonLink>
      </section>
    </div>
  );
}
