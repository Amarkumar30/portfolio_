import type { Metadata } from "next";
import { socialLinks, siteContent } from "@/lib/data";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.amarkumar.dev"
).replace(/\/$/, "");

// Inlined at build time by next.config.ts, so it reflects whether public/resume.pdf
// shipped with this deploy. TODO(amar): add public/resume.pdf
export const hasResume = process.env.NEXT_PUBLIC_HAS_RESUME === "1";
// TODO(amar): add photo at public/amar.jpg
export const hasPhoto = process.env.NEXT_PUBLIC_HAS_PHOTO === "1";
export const siteTitle = "Amar Kumar | Software Engineer";
export const siteDescription =
  "Amar Kumar is a software engineer building full-stack products and researching Generative Engine Optimization: how brands get found when AI answers the question.";
export const ogImagePath = "/opengraph-image";

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const fullTitle = title === "Home" ? siteTitle : `${title} | Amar Kumar`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteTitle,
      type: "website",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: "Amar Kumar, software engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImagePath],
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
  sameAs: sameAsLinks,
};
