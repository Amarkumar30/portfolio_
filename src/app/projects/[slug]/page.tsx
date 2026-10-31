/**
 * Project case study: label, title, summary, a meta row (role · stack · links), optional cover,
 * then the case study body (problem, what I built, hard part, next).
 * Props: route params containing the project slug.
 * Used in: dynamic /projects/[slug] routes.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ArticleFooter, ArticleHeader, ReadingLayout } from "@/components/reading/reading-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { getEntries, getEntry } from "@/lib/content/loader";
import { getH2Headings } from "@/lib/headings";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata, projectStructuredData } from "@/lib/site";

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
        image: `/projects/${project.slug}/opengraph-image`,
      })
    : { title: "Project not found" };
}

export function generateStaticParams() {
  return getEntries("projects").map((project) => ({ slug: project.slug }));
}

function MetaItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="eyebrow mb-2">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getEntry("projects", slug);

  if (!project) {
    notFound();
  }

  const { data } = project;
  const content = await renderMdx(project.body);
  const projects = getEntries("projects");
  const index = projects.findIndex((entry) => entry.slug === project.slug);
  const neighbour = (offset: number) => {
    const entry = projects[index + offset];
    return entry ? { href: `/projects/${entry.slug}`, title: entry.data.title } : undefined;
  };

  return (
    <ReadingLayout headings={getH2Headings(project.body)}>
      <JsonLd
        data={projectStructuredData({
          title: data.title,
          description: data.summary,
          path: `/projects/${project.slug}`,
          stack: data.stack,
          links: data.links,
        })}
      />
      <ArticleHeader
        back={{ href: "/projects", label: "Projects" }}
        eyebrow={`${data.status ?? "Case study"}${data.draft ? " · Draft" : ""}`}
        title={data.title}
        lead={data.summary}
      >
        {data.collaborationNote ? (
          <p className="mt-4 border-l-2 pl-4 text-small text-muted">{data.collaborationNote}</p>
        ) : null}

        <dl className="mt-8 grid gap-6 border-y py-6 text-small sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <MetaItem label="Role" className="sm:row-span-2">
            <p className="text-foreground">{data.role}</p>
          </MetaItem>
          {data.stack.length > 0 ? (
            <MetaItem label="Stack">
              <ul className="flex flex-wrap gap-1.5">
                {data.stack.map((item) => (
                  <li key={item} className="tag">
                    {item}
                  </li>
                ))}
              </ul>
            </MetaItem>
          ) : null}
          {data.links.length > 0 ? (
            <MetaItem label="Links">
              <ul className="flex flex-wrap gap-x-4">
                {data.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="link inline-flex min-h-11 items-center gap-1 sm:min-h-0">
                      {link.label}
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </MetaItem>
          ) : null}
        </dl>
      </ArticleHeader>

      {data.cover ? (
        <Image
          src={data.cover}
          alt={data.coverAlt ?? `Screenshot of ${data.title}`}
          width={1360}
          height={765}
          priority
          sizes="(min-width: 768px) 680px, 100vw"
          className="mb-10 aspect-video w-full rounded-card border object-cover"
        />
      ) : null}

      <div className="rich-text">{content}</div>

      <ArticleFooter
        previous={neighbour(-1)}
        next={neighbour(1)}
        back={{ href: "/projects", label: "Back to projects" }}
      />
    </ReadingLayout>
  );
}
