/**
 * About page: Amar's story, how engineering, research and building connect, and grouped skills.
 * Props: none for the route component.
 * Used in: /about route.
 */
import type { Metadata } from "next";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { ButtonLink } from "@/components/ui/button-link";
import { Portrait } from "@/components/ui/portrait";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutStory, familiarWith, siteContent, skillCategories } from "@/lib/data";
import { buildMetadata, hasResume } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "How Amar Kumar got into building software, why he researches Generative Engine Optimization, and the kind of engineering team he wants to join.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-shell space-y-20 py-12 sm:py-20">
      <PersonJsonLd />

      <article className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-8">
            <SectionHeading as="h1" eyebrow="About" title={aboutStory.title} />
            <div className="rich-text max-w-[68ch]">
              {aboutStory.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="text-foreground">{aboutStory.teamNote}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">Get in touch</ButtonLink>
              {hasResume ? (
                <ButtonLink href="/resume.pdf" variant="secondary">
                  Resume
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <aside className="space-y-8 text-sm leading-6 lg:pt-8">
            <Portrait size={112} />
            <div className="space-y-2">
              <h2 className="eyebrow">Education</h2>
              <p>{siteContent.education}</p>
            </div>
            <div className="space-y-2">
              <h2 className="eyebrow">Recognition</h2>
              <ul className="space-y-1">
                {siteContent.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h2 className="eyebrow">Research</h2>
              <p>Research Intern, South Asian University — Generative Engine Optimization</p>
            </div>
          </aside>
      </article>

      <section aria-labelledby="skills-title" className="space-y-8">
        <SectionHeading id="skills-title" title="Skills" />
        <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category) => (
            <div key={category.title} className="space-y-2 border-t pt-4">
              <dt className="font-semibold">{category.title}</dt>
              <dd className="text-sm leading-6 text-muted">{category.items.join(" · ")}</dd>
            </div>
          ))}
          <div className="space-y-2 border-t pt-4">
            <dt className="font-semibold">Familiar with</dt>
            <dd className="text-sm leading-6 text-muted">{familiarWith.join(" · ")}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
