/**
 * Projects index page lists project case studies.
 * Props: none for the route component.
 * Used in: /projects route.
 */
import type { Metadata } from "next";
import { ContentCard } from "@/components/sections/content-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Projects by Amar Kumar: Bayana, his booking platform for independent wedding vendors; a hostel management platform with a RAG assistant; and FreshSip, a UPI ordering system for a local juice bar.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getEntries("projects");

  return (
    <div className="container-shell page space-y-12">
      <SectionHeading
        as="h1"
        eyebrow="Projects"
        title="Things I've built, and what they taught me."
        description="Each one starts with a real problem. I note what I owned, what was hard, and what I'd change next."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.slug} index={index}>
            <ContentCard
              href={`/projects/${project.slug}`}
              label={project.data.status ?? "Case study"}
              title={project.data.title}
              summary={project.data.summary}
              tags={project.data.stack}
              headingLevel="h2"
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
