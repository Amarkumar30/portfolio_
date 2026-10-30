/**
 * Home page: who Amar is, what he's building toward, what he's doing now, selected work and recent writing.
 * Props: none for the route component.
 * Used in: / route entry point.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { BlogCard } from "@/components/sections/blog-card";
import { ProjectCard } from "@/components/sections/project-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts } from "@/lib/blog";
import { buildingToward, projects, siteContent } from "@/lib/data";
import { getNow } from "@/lib/now";
import { buildMetadata, hasResume } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Amar Kumar is a software engineer building full-stack products and researching Generative Engine Optimization: how brands get found when AI answers the question.",
  path: "/",
});

export default async function HomePage() {
  const latestPosts = getAllPosts().slice(0, 2);
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 2);
  const now = await getNow();

  return (
    <div className="container-shell space-y-24 py-12 sm:space-y-28 sm:py-20">
      <PersonJsonLd />

      <Reveal>
        <section aria-labelledby="hero-title" className="max-w-3xl space-y-6">
          <p className="eyebrow">{siteContent.availability}</p>
          <h1
            id="hero-title"
            className="font-heading text-4xl font-semibold tracking-tight sm:text-6xl"
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
        </section>
      </Reveal>

      <section aria-labelledby="building-title" className="space-y-10">
        <SectionHeading id="building-title" title={buildingToward.title} />
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {buildingToward.items.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05} className="space-y-3 border-t pt-5">
              <p className="eyebrow">{item.label}</p>
              <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
              <p className="text-base leading-7 text-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
        <p className="max-w-[68ch] font-heading text-lg leading-8 text-foreground">
          {buildingToward.closing}
        </p>
      </section>

      {now ? (
        <section aria-labelledby="now-title" className="max-w-[68ch] space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="now-title" className="font-heading text-2xl font-semibold">
              Now
            </h2>
            {now.updated ? (
              <p className="text-sm text-muted">
                Updated{" "}
                {new Date(now.updated).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
          <div className="rich-text border-l-2 border-accent pl-5">{now.content}</div>
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
              <ProjectCard project={project} />
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
                <BlogCard post={post} />
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

      <section className="max-w-[68ch] space-y-4 border-t pt-10">
        <h2 className="font-heading text-2xl font-semibold">Working on something similar?</h2>
        <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Hiring, building in AI search, or curious about GEO for Indian brands — I&apos;d
          like to hear about it.
        </p>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </section>
    </div>
  );
}
