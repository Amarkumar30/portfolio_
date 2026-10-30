import { getEntries, getEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Amar Kumar";

export function generateStaticParams() {
  return getEntries("blog").map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getEntry("blog", slug);

  return renderOgImage(
    post
      ? { eyebrow: post.data.category, title: post.data.title, subtitle: post.data.excerpt }
      : { eyebrow: "Amar Kumar", title: "Not found" },
  );
}
