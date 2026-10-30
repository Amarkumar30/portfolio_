import { getEntries, getEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Amar Kumar";

export function generateStaticParams() {
  return getEntries("research").map((entry) => ({ slug: entry.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry("research", slug);

  return renderOgImage(
    entry
      ? { eyebrow: entry.data.status, title: entry.data.title, subtitle: entry.data.excerpt }
      : { eyebrow: "Amar Kumar", title: "Not found" },
  );
}
