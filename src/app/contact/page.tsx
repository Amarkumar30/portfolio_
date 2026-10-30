/**
 * Contact page: who should reach out and about what, a contact form, and direct links.
 * Props: none for the route component.
 * Used in: /contact route.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactContent, socialLinks } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Amar Kumar about SDE internships and roles, GEO and AI search, startups, or research collaborations.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-shell py-12 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal className="space-y-8">
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title={contactContent.title}
            description={contactContent.intro}
          />
          <ul className="space-y-2 text-base leading-7 text-muted">
            {contactContent.topics.map((topic) => (
              <li key={topic} className="flex gap-3">
                <span aria-hidden="true" className="text-accent">
                  —
                </span>
                {topic}
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t pt-6">
            <p className="text-sm text-muted">{contactContent.note}</p>
            <ul className="space-y-2 text-sm">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <span className="inline-block w-20 text-muted">{link.label}</span>
                  <Link href={link.href} className="font-medium hover:text-accent hover:underline">
                    {link.display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
