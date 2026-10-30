/**
 * Project detail page expands one project into a fuller recruiter-friendly case study.
 * Props: route params containing the project slug.
 * Used in: dynamic /projects/[slug] routes.
 * TODO(amar): add GitHub/demo links and screenshots in src/lib/data.ts.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return project
    ? buildMetadata({
        title: project.title,
        description: project.summary,
        path: `/projects/${project.slug}`,
      })
    : {
        title: "Project",
        description: "Project details.",
      };
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="container-shell space-y-10 py-10 sm:py-14">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <Reveal className="section-card p-8 sm:p-10">
        <div className="space-y-6">
          <span className="eyebrow">Project case study</span>
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {project.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted">{project.summary}</p>
            {project.collaborationNote ? (
              <p className="rounded-2xl border bg-accent-soft px-4 py-3 text-sm leading-7 text-muted">
                {project.collaborationNote}
              </p>
            ) : null}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="section-card p-6">
          <h2 className="font-heading text-2xl font-semibold">Problem statement</h2>
          <p className="mt-4 text-base leading-8 text-muted">{project.problemStatement}</p>

          <h2 className="mt-8 font-heading text-2xl font-semibold">My contributions</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            {project.contributions.map((contribution) => (
              <li key={contribution}>{contribution}</li>
            ))}
          </ul>
        </Reveal>

        <div className="space-y-6">
          <Reveal className="section-card p-6">
            <h2 className="font-heading text-2xl font-semibold">Tech stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-3 py-1.5 text-sm text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
          {project.image ? (
            <Reveal className="section-card overflow-hidden" delay={0.08}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={1200}
                height={750}
                className="h-auto w-full"
              />
            </Reveal>
          ) : null}
          {project.links.length > 0 ? (
            <Reveal className="section-card p-6" delay={0.12}>
              <h2 className="font-heading text-2xl font-semibold">Links</h2>
              <div className="mt-4 flex flex-col gap-3">
                {project.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
                  >
                    {link.label}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
