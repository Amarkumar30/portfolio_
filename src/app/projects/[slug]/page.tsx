/**
 * Project detail page: summary, role, then the case study body (problem, what I built, hard part, next).
 * Props: route params containing the project slug.
 * Used in: dynamic /projects/[slug] routes.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getEntries, getEntry } from "@/lib/content/loader";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getEntry("projects", slug);

  return project
    ? buildMetadata({
        title: project.data.title,
        description: project.data.summary,
        path: `/projects/${project.slug}`,
      })
    : { title: "Project not found" };
}

export function generateStaticParams() {
  return getEntries("projects").map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getEntry("projects", slug);

  if (!project) {
    notFound();
  }

  const { data } = project;
  const content = await renderMdx(project.body);

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
        <p className="eyebrow">Case study{data.draft ? " · Draft" : ""}</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {data.title}
        </h1>
        <p className="text-lg leading-8 text-muted">{data.summary}</p>
        {data.collaborationNote ? (
          <p className="border-l-2 border-accent pl-4 text-sm leading-6 text-muted">
            {data.collaborationNote}
          </p>
        ) : null}
      </header>

      {data.cover ? (
        <Image
          src={data.cover}
          alt={data.coverAlt ?? `Screenshot of ${data.title}`}
          width={1200}
          height={750}
          priority
          className="h-auto w-full rounded-2xl border"
        />
      ) : null}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="rich-text max-w-[68ch]">
          <h2>My role</h2>
          <p>{data.role}</p>
          {content}
        </article>

        <aside className="space-y-8 text-sm">
          {data.stack.length > 0 ? (
            <div className="space-y-3">
              <h2 className="eyebrow">Stack</h2>
              <ul className="flex flex-wrap gap-2">
                {data.stack.map((item) => (
                  <li key={item} className="rounded-full border px-3 py-1 text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.links.length > 0 ? (
            <div className="space-y-3">
              <h2 className="eyebrow">Links</h2>
              <ul className="space-y-2">
                {data.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-2 font-semibold text-accent hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
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
