import { getEntries, getEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Amar Kumar";

export function generateStaticParams() {
  return getEntries("projects").map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getEntry("projects", slug);

  return renderOgImage(
    project
      ? { eyebrow: project.data.status ?? "Case study", title: project.data.title, subtitle: project.data.summary }
      : { eyebrow: "Amar Kumar", title: "Not found" },
  );
}
