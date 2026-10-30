/**
 * Projects index page lists project case studies.
 * Props: none for the route component.
 * Used in: /projects route.
 */
import type { Metadata } from "next";
import { ProjectCard } from "@/components/sections/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { projects } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Case studies by Amar Kumar: a hostel management platform with a RAG assistant, and FreshSip, a UPI ordering system for a local juice bar.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="container-shell space-y-12 py-12 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Projects"
        title="Things I've built, and what they taught me."
        description="Each one starts with a real problem. I note what I owned, what was hard, and what I'd change next."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.05}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
