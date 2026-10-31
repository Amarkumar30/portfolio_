/**
 * /llms.txt — a plain-Markdown summary of who Amar is and where things are, for LLMs and
 * answer engines (llmstxt.org format). Built from the same content as the site.
 */
import { getEntries } from "@/lib/content/loader";
import { contactEmail, siteContent, socialLinks } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function list(items: { title: string; path: string; note: string }[]) {
  return items.map((item) => `- [${item.title}](${siteUrl}${item.path}): ${item.note}`).join("\n");
}

export function GET() {
  const research = getEntries("research").map((entry) => ({
    title: entry.data.title,
    path: `/research/${entry.slug}`,
    note: entry.data.excerpt,
  }));
  const projects = getEntries("projects").map((entry) => ({
    title: entry.data.title,
    path: `/projects/${entry.slug}`,
    note: entry.data.summary,
  }));
  const posts = getEntries("blog").map((entry) => ({
    title: entry.data.title,
    path: `/blog/${entry.slug}`,
    note: entry.data.excerpt,
  }));

  const body = `# ${siteContent.name}

> ${siteContent.name} is a ${siteContent.role.toLowerCase()} and B.Tech Computer Science student at South Asian University, Delhi (2024–2028). He is the solo founder of Bayana (https://bayana.in), builds full-stack web products, and is a research intern at SAU on Generative Engine Optimization (GEO): how brands become visible inside LLM-driven answer engines such as ChatGPT, Perplexity and Gemini.

- **Engineering:** Builds full-stack web products end to end (TypeScript, React, NestJS, Express, tRPC, PostgreSQL, MySQL, real-time features with Socket.IO, JWT auth and role-based access).
- **Research:** Developing Hinglish-GEO-Bench, which tests whether an LLM's brand recommendation shifts when the same query is asked in Hinglish instead of English, and the Indian Brand Visibility Score (IBVS), a measurable score for a brand's presence in generative answers.
- **Founder:** Building Bayana (https://bayana.in), solo and in progress: a booking platform for independent Indian wedding and event vendors, starting with wedding photographers in Delhi NCR. Vendors lock a date with an advance payment (UPI via Razorpay) and a written record.
- **Long-term:** A GEO-focused startup for Indian brands.
- **Recognition:** 1st Prize, AvishkarX — CSI × SAU Ideathon.
- **Communication:** Runs a YouTube channel, Signal Clear.
- **Availability:** ${siteContent.availability}.

## Research

${list(research)}

## Projects

${list(projects)}

## Writing

${list(posts)}
- [Notes](${siteUrl}/notes): Short updates on what he's building and learning.

## About and contact

- [About](${siteUrl}/about): Background, and how engineering, research and entrepreneurship connect.
- [Journey](${siteUrl}/about#journey): A timeline of milestones on the About page.
- [Now](${siteUrl}/now): What he's focused on this month.
- [Contact](${siteUrl}/contact): For SDE roles, GEO and AI search, startups, and research collaborations.
- Email: ${contactEmail}
${socialLinks
  .filter((link) => link.label !== "Email")
  .map((link) => `- ${link.label}: ${link.href}`)
  .join("\n")}

## Optional

- [RSS feed](${siteUrl}/feed.xml): Essays and notes.
- [Sitemap](${siteUrl}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
