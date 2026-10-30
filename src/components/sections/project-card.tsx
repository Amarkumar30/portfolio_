/**
 * ProjectCard renders a preview of a project with stack tags and a detail-page link.
 * Props: a single Project object.
 * Used in: home featured projects and the projects index page.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="section-card group relative flex h-full flex-col p-6 hover:border-accent/50">
      <h3 className="font-heading text-xl font-semibold tracking-tight">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </h3>
      <p className="mt-3 text-base leading-7 text-muted">{project.summary}</p>
      <ul
        className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted"
        aria-label="Stack"
      >
        {project.stack.slice(0, 5).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-accent">
        Read case study
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </p>
    </article>
  );
}
