/**
 * Home page introduces Amar Kumar with highlights, featured projects, latest writing, and grouped skills.
 * Props: none for the route component.
 * Used in: / route entry point.
 * TODO: Replace placeholder project/demo links and resume file with finalized assets.
 */
import { ArrowRight } from "lucide-react";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { BlogCard } from "@/components/sections/blog-card";
import { ProjectCard } from "@/components/sections/project-card";
import { SkillGroup } from "@/components/sections/skill-group";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts } from "@/lib/blog";
import {
  familiarWith,
  projects,
  quickHighlights,
  siteContent,
  skillCategories,
} from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Explore Amar Kumar's portfolio, featured full-stack projects, engineering skills, and latest writing on GEO research and SDE growth.",
  path: "/",
});

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3);
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <div className="container-shell space-y-24 py-10 sm:py-14">
      <PersonJsonLd />
      <Reveal className="section-card overflow-hidden p-8 sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-7">
            <span className="eyebrow">Open to internships and SDE roles</span>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {siteContent.name}
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-muted sm:text-2xl">
                {siteContent.tagline}
              </p>
              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                {siteContent.intro}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/projects">View Projects</ButtonLink>
              <ButtonLink href="/blog" variant="secondary">
                Read Blog
              </ButtonLink>
              <ButtonLink href="/resume.pdf" variant="secondary">
                Download Resume
              </ButtonLink>
            </div>
          </div>
          <div className="section-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Snapshot
            </p>
            <dl className="mt-5 space-y-5">
              {quickHighlights.map((item) => (
                <div key={item.label}>
                  <dt className="text-sm font-medium text-muted">{item.label}</dt>
                  <dd className="mt-1 text-lg leading-8 text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Selected work"
          title="Projects built with product thinking and implementation detail."
          description="A mix of collaborative hackathon builds and practical full-stack systems, written for recruiters who want the signal fast."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
        <ButtonLink href="/projects" variant="secondary" className="gap-2">
          Explore all projects
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Latest writing"
          title="Notes on GEO research, engineering, and what I’m learning."
          description="The blog is local-file powered with MDX so I can publish quickly without a CMS. Posts are structured for scannability and future iteration."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {latestPosts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.08}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Skills snapshot"
          title="Grouped skills, tools, and technical areas I reach for most."
          description="Structured content lives in a central data file so updates stay easy as your experience evolves."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {skillCategories.map((category, index) => (
            <Reveal key={category.title} delay={index * 0.05}>
              <SkillGroup {...category} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="section-card p-5">
            <p className="font-heading text-xl font-semibold">Familiar with</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Listed separately to keep the main skills honest and calibrated.{" "}
              {familiarWith.join(", ")}.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
