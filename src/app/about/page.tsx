/**
 * About page: Amar's story in the reading column, a sidebar with education, focus, recognition
 * and links, the journey timeline, then grouped skills.
 * Props: none for the route component.
 * Used in: /about route.
 */
import type { Metadata } from "next";
import { JourneySection } from "@/components/journey/journey-section";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import { ButtonLink } from "@/components/ui/button-link";
import { Portrait } from "@/components/ui/portrait";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutStory, familiarWith, siteContent, skillCategories, socialLinks } from "@/lib/data";
import { buildMetadata, hasResume } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "How Amar Kumar got into building software, why he researches Generative Engine Optimization, and the kind of engineering team he wants to join.",
  path: "/about",
});

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t pt-4">
      <h2 className="eyebrow mb-2">{title}</h2>
      {children}
    </div>
  );
}

export default function AboutPage() {
  const skills = [...skillCategories, { title: "Familiar with", items: familiarWith }];

  return (
    <div className="container-shell page space-y-section">
      <PersonJsonLd />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,42.5rem)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <article>
          <SectionHeading as="h1" eyebrow="About" title={aboutStory.title} />
          <div className="rich-text mt-10">
            {aboutStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="text-foreground">{aboutStory.teamNote}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Get in touch</ButtonLink>
            {hasResume ? (
              <ButtonLink href="/resume.pdf" variant="secondary">
                Resume
              </ButtonLink>
            ) : null}
          </div>
          <div className="mt-section">
            <JourneySection />
          </div>
        </article>

        <aside aria-label="At a glance" className="lg:pt-2">
          <div className="space-y-6 text-small lg:sticky lg:top-[calc(var(--header-height)+3rem)]">
            <Portrait size={72} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <SidebarGroup title="Education">
                <p>{siteContent.education}</p>
              </SidebarGroup>
              <SidebarGroup title="Focus">
                <ul className="space-y-1">
                  {siteContent.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </SidebarGroup>
              <SidebarGroup title="Recognition">
                <ul className="space-y-1">
                  {siteContent.achievements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </SidebarGroup>
              <SidebarGroup title="Links">
                <ul>
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="link inline-flex min-h-11 min-w-11 items-center lg:min-h-8 lg:min-w-0">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </SidebarGroup>
            </div>
          </div>
        </aside>
      </div>

      <section aria-labelledby="skills-title" className="max-w-[42.5rem] space-y-6">
        <SectionHeading id="skills-title" title="Skills" />
        <dl className="border-t">
          {skills.map((category) => (
            <div
              key={category.title}
              className="grid gap-1 border-b py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="font-medium">{category.title}</dt>
              <dd className="text-muted">{category.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
