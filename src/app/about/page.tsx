/**
 * About page expands Amar's story, current focus, education, and motivation for building.
 * Props: none for the route component.
 * Used in: /about route.
 * TODO: Refine wording over time as your positioning evolves, but keep the GEO focus accurate.
 */
import type { Metadata } from "next";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { skillCategories, siteContent } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Learn about Amar Kumar's background, GEO research focus, engineering journey, education at South Asian University, and communication work through Signal Clear.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-shell space-y-16 py-10 sm:py-14">
      <PersonJsonLd />
      <Reveal className="section-card p-8 sm:p-10">
        <SectionHeading
          eyebrow="About"
          title="Engineering, research, and the reason I keep building."
          description={siteContent.about}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rich-text">
            <p>{siteContent.about}</p>
            <p>
              My current focus sits in two tracks that reinforce each other: research
              into Generative Engine Optimization, and deliberate preparation for SDE
              roles where product quality, systems thinking, and ownership matter.
            </p>
            <p>{siteContent.personalNote}</p>
            <p>{siteContent.youtubeNote}</p>
          </div>
          <div className="space-y-5">
            <div className="section-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Education
              </p>
              <p className="mt-3 text-lg leading-8">{siteContent.education}</p>
            </div>
            <div className="section-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Current focus
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                {siteContent.currentFocus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <ButtonLink href="/resume.pdf">Download Resume</ButtonLink>
          </div>
        </div>
      </Reveal>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Skill map"
          title="Capabilities I want recruiters and hiring teams to assess quickly."
          description="These categories mirror the structure on the home page so the site stays easy to scan in under a minute."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {skillCategories.map((category, index) => (
            <Reveal
              key={category.title}
              delay={index * 0.05}
              className="section-card p-5"
            >
              <h3 className="font-heading text-xl font-semibold">{category.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                {category.items.join(" • ")}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
