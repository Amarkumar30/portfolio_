/**
 * Projects index page lists seeded project case studies backed by structured data.
 * Props: none for the route component.
 * Used in: /projects route.
 * TODO: Add future projects in src/lib/data.ts to keep logic and content separate.
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
    "Browse project case studies by Amar Kumar, including a hostel management platform and FreshSip, with problem statements, tech stacks, and specific contributions.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="container-shell space-y-12 py-10 sm:py-14">
      <Reveal className="section-card p-8 sm:p-10">
        <SectionHeading
          eyebrow="Projects"
          title="Case studies framed around the problem, stack, and my contribution."
          description="The copy here avoids inflated ownership claims and keeps collaborative context explicit, especially for hackathon work."
        />
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.08}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
