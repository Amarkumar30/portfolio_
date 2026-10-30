import type { Metadata } from "next";
import { socialLinks, siteContent } from "@/lib/data";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.amarkumar.dev"
).replace(/\/$/, "");

// Inlined at build time by next.config.ts, so it reflects whether public/resume.pdf
// shipped with this deploy. Open items for both files are in TODO.md.
export const hasResume = process.env.NEXT_PUBLIC_HAS_RESUME === "1";
export const hasPhoto = process.env.NEXT_PUBLIC_HAS_PHOTO === "1";
export const siteTitle = "Amar Kumar | Software Engineer";
export const siteDescription =
  "Amar Kumar is a software engineer building full-stack products and researching Generative Engine Optimization: how brands get found when AI answers the question.";
export const ogImagePath = "/opengraph-image";

export function buildMetadata({
  title,
  description,
  path = "/",
  type = "website",
  image = ogImagePath,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  /** Path of the share image; per-entry pages pass their own opengraph-image route. */
  image?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const isHome = title === "Home";
  const fullTitle = isHome ? siteTitle : `${title} | Amar Kumar`;

  return {
    title: isHome ? { absolute: siteTitle } : title,
    description,
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Amar Kumar",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title === "Home" ? "Amar Kumar, software engineer" : title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

const sameAsLinks = socialLinks
  .filter((link) => link.label !== "Email")
  .map((link) => link.href);

export const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteContent.name,
  url: siteUrl,
  email: "amar.kumar.career@gmail.com",
  jobTitle: "Software Engineer",
  description: siteDescription,
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "South Asian University",
  },
  knowsAbout: [
    "Full-stack engineering",
    "Generative Engine Optimization",
    "AI search visibility",
    "RAG pipelines",
    "LLM integration",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Bayana",
    url: "https://bayana.in",
    description:
      "Booking platform for independent Indian wedding and event vendors, starting with wedding photographers in Delhi NCR.",
    founder: { "@type": "Person", name: siteContent.name, url: siteUrl },
  },
  sameAs: sameAsLinks,
};

const author = { "@type": "Person", name: siteContent.name, url: siteUrl };

export function articleStructuredData({
  type,
  title,
  description,
  path,
  date,
  tags = [],
}: {
  type: "BlogPosting" | "ScholarlyArticle";
  title: string;
  description: string;
  path: string;
  date: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description,
    url: `${siteUrl}${path}`,
    mainEntityOfPage: `${siteUrl}${path}`,
    datePublished: date,
    dateModified: date,
    image: `${siteUrl}${path}/opengraph-image`,
    keywords: tags.join(", ") || undefined,
    inLanguage: "en-IN",
    author,
    publisher: author,
  };
}

export function projectStructuredData({
  title,
  description,
  path,
  stack,
  links,
}: {
  title: string;
  description: string;
  path: string;
  stack: string[];
  links: { label: string; href: string }[];
}) {
  const repository = links.find((link) => link.href.startsWith("https://github.com/"));

  return {
    "@context": "https://schema.org",
    // SoftwareSourceCode once there's a public repo to point at; CreativeWork until then.
    "@type": repository ? "SoftwareSourceCode" : "CreativeWork",
    name: title,
    description,
    url: `${siteUrl}${path}`,
    image: `${siteUrl}${path}/opengraph-image`,
    keywords: stack.join(", "),
    ...(repository ? { codeRepository: repository.href, programmingLanguage: stack } : {}),
    author,
    creator: author,
  };
}
