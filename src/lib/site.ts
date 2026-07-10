import type { Metadata } from "next";
import { socialLinks, siteContent } from "@/lib/data";

export const siteUrl = "https://amar-portfolio.vercel.app";
export const siteTitle = "Amar Kumar | Portfolio & Blog";
export const siteDescription =
  "Portfolio and blog of Amar Kumar, a Computer Science & Engineering undergraduate building full-stack products and researching Generative Engine Optimization.";
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
          alt: "Amar Kumar portfolio and blog preview",
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
  jobTitle: "Aspiring Software Development Engineer",
  description: siteDescription,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "South Asian University",
  },
  knowsAbout: [
    "Full-stack engineering",
    "Generative Engine Optimization",
    "RAG pipelines",
    "LLM integration",
  ],
  sameAs: sameAsLinks,
};
