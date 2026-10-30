/**
 * /feed.xml — RSS 2.0 feed of essays and notes, newest first.
 */
import { getEntries } from "@/lib/content/loader";
import { siteContent } from "@/lib/data";
import { siteDescription, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainText(markdown: string, max = 280) {
  const text = markdown
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function GET() {
  const items = [
    ...getEntries("blog").map((post) => ({
      title: post.data.title,
      url: `${siteUrl}/blog/${post.slug}`,
      date: post.data.date,
      description: post.data.excerpt,
      categories: [post.data.category, ...post.data.tags],
    })),
    ...getEntries("notes").map((note) => ({
      title: note.data.title,
      url: `${siteUrl}/notes#${note.slug}`,
      date: note.data.date,
      description: plainText(note.body),
      categories: ["Notes", ...note.data.tags],
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteContent.name)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-IN</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items[0] ? `<lastBuildDate>${new Date(`${items[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>` : ""}
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
${item.categories.map((category) => `      <category>${escapeXml(category)}</category>`).join("\n")}
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
