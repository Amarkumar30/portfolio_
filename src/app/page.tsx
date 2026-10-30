/**
 * Home page: who Amar is, what he's building toward, what he's doing now, selected work, writing and notes.
 * Props: none for the route component.
 * Used in: / route entry point.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { ContentCard } from "@/components/sections/content-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Portrait } from "@/components/ui/portrait";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries, getSingle } from "@/lib/content/loader";
import { buildingToward, siteContent } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata, hasResume } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Amar Kumar is a software engineer building full-stack products and researching Generative Engine Optimization: how brands get found when AI answers the question.",
  path: "/",
});

export default async function HomePage() {
  const latestPosts = getEntries("blog").slice(0, 2);
  const recentNotes = getEntries("notes").slice(0, 3);
  const featuredProjects = getEntries("projects")
    .filter((project) => project.data.featured)
    .slice(0, 2);
  const now = getSingle("now");
  const nowContent = now ? await renderMdx(now.body) : null;

  return (
    <div className="container-shell space-y-24 py-12 sm:space-y-28 sm:py-20">
      <PersonJsonLd />

      <section
        aria-labelledby="hero-title"
        className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow">{siteContent.availability}</p>
          <h1
            id="hero-title"
            className="text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            {siteContent.name}
          </h1>
          <p className="text-xl leading-8 text-balance text-foreground sm:text-2xl sm:leading-10">
            {siteContent.tagline}
          </p>
          <div className="max-w-[68ch] space-y-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {siteContent.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/projects">View work</ButtonLink>
            <ButtonLink href="/blog" variant="secondary">
              Read writing
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Get in touch
            </ButtonLink>
            {hasResume ? (
              <ButtonLink href="/resume.pdf" variant="secondary">
                Resume
              </ButtonLink>
            ) : null}
          </div>
        </div>
        <Portrait size={128} priority className="sm:mt-2" />
      </section>

      <section aria-labelledby="building-title" className="space-y-10">
        <SectionHeading id="building-title" title={buildingToward.title} />
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {buildingToward.items.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05} className="space-y-3 border-t pt-5">
              <p className="eyebrow">{item.label}</p>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-base leading-7 text-muted">{item.body}</p>
              {item.link ? (
                <Link
                  href={item.link.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  {item.link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </Reveal>
          ))}
        </div>
        <p className="max-w-[68ch] text-lg leading-8 text-foreground">
          {buildingToward.closing}
        </p>
      </section>

      {now ? (
        <section aria-labelledby="now-title" className="max-w-[68ch] space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="now-title" className="text-2xl font-semibold">
              Now
            </h2>
            <p className="text-sm text-muted">
              Updated {formatDate(now.data.updated, "month")}
            </p>
          </div>
          <div className="rich-text border-l-2 border-accent pl-5">{nowContent}</div>
          <Link href="/now" className="inline-block text-sm font-semibold text-accent hover:underline">
            More on what I&apos;m doing now
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="work-title" className="space-y-8">
        <SectionHeading
          id="work-title"
          eyebrow="Selected work"
          title="Problems I've worked on"
          description="Each one started with a real workflow that wasn't working."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.05}>
              <ContentCard
                href={`/projects/${project.slug}`}
                eyebrow={project.data.status}
                title={project.data.title}
                summary={project.data.summary}
                meta={project.data.stack.slice(0, 4)}
                cta="Read case study"
              />
            </Reveal>
          ))}
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          All projects
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {latestPosts.length > 0 ? (
        <section aria-labelledby="writing-title" className="space-y-8">
          <SectionHeading
            id="writing-title"
            eyebrow="Writing"
            title="Recent writing"
            description="On GEO, AI search, and what I learn while building."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {latestPosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.05}>
                <ContentCard
                  href={`/blog/${post.slug}`}
                  eyebrow={post.data.category}
                  title={post.data.title}
                  summary={post.data.excerpt}
                  meta={[formatDate(post.data.date, "short"), post.readingTime]}
                />
              </Reveal>
            ))}
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            All writing
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {recentNotes.length > 0 ? (
        <section aria-labelledby="notes-title" className="max-w-[68ch] space-y-6">
          <h2 id="notes-title" className="text-2xl font-semibold">
            Recent notes
          </h2>
          <ul className="divide-y border-y">
            {recentNotes.map((note) => (
              <li key={note.slug}>
                <Link
                  href={`/notes#${note.slug}`}
                  className="flex flex-col gap-1 py-4 hover:text-accent sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="font-medium">{note.data.title}</span>
                  <time dateTime={note.data.date} className="shrink-0 text-sm text-muted">
                    {formatDate(note.data.date, "short")}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            All notes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <section className="max-w-[68ch] space-y-4 border-t pt-10">
        <h2 className="text-2xl font-semibold">Working on something similar?</h2>
        <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Hiring, building in AI search, or curious about GEO for Indian brands — I&apos;d
          like to hear about it.
        </p>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </section>
    </div>
  );
}
