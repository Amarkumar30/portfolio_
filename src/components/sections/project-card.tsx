/**
 * ProjectCard renders a preview of a project with stack tags and a detail-page link.
 * Props: a single Project object.
 * Used in: home featured projects and the projects index page.
 * TODO: Replace placeholder links with real repo/demo URLs when available.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="section-card group flex h-full flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Project</p>
          <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
            {project.title}
          </h3>
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 text-muted transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
      </div>
      <p className="text-sm leading-7 text-muted">{project.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.stack.slice(0, 5).map((item) => (
          <span
            key={item}
            className="rounded-full border px-3 py-1 text-xs font-medium text-muted"
          >
            {item}
          </span>
        ))}
      </div>
      <Link
        href={`/projects/${project.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
      >
        View case study
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
