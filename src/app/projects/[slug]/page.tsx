/**
 * Project detail page: problem, role, what was built, the hard part, and what's next.
 * Props: route params containing the project slug.
 * Used in: dynamic /projects/[slug] routes.
 * TODO(amar): add GitHub/demo links and screenshots in src/lib/data.ts.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
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

  const sections = [
    { title: "Problem", body: project.problem },
    { title: "My role", body: project.role },
  ];

  return (
    <div className="container-shell space-y-12 py-12 sm:py-20">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All projects
      </Link>

      <header className="max-w-[68ch] space-y-5">
          <p className="eyebrow">Case study</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-lg leading-8 text-muted">{project.summary}</p>
          {project.collaborationNote ? (
            <p className="border-l-2 border-accent pl-4 text-sm leading-6 text-muted">
              {project.collaborationNote}
            </p>
          ) : null}
      </header>

      {project.image ? (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          width={1200}
          height={750}
          className="h-auto w-full rounded-2xl border"
        />
      ) : null}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="rich-text max-w-[68ch]">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <section>
            <h2>What I built</h2>
            <ul>
              {project.built.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>The hard part</h2>
            <p>{project.hardPart}</p>
          </section>
          <section>
            <h2>What I&apos;d do next</h2>
            <p>{project.next}</p>
          </section>
        </article>

        <aside className="space-y-8 text-sm">
          <div className="space-y-3">
            <h2 className="eyebrow">Stack</h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li key={item} className="rounded-full border px-3 py-1 text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {project.links.length > 0 ? (
            <div className="space-y-3">
              <h2 className="eyebrow">Links</h2>
              <ul className="space-y-2">
                {project.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 font-semibold text-accent hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
