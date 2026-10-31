/**
 * Contact page: who should reach out and about what, direct links, and the contact form.
 * Intro and links on the left, the form on the right (stacked on mobile).
 * Props: none for the route component.
 * Used in: /contact route.
 */
import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact-form";
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
    <div className="container-shell page">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title={contactContent.title}
            description={contactContent.intro}
          />
          <ul className="mt-8 space-y-2 text-muted">
            {contactContent.topics.map((topic) => (
              <li key={topic} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-subtle" />
                {topic}
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t pt-6">
            <p className="text-small text-muted">{contactContent.note}</p>
            <dl className="mt-4 text-small">
              {socialLinks.map((link) => (
                <div key={link.label} className="flex flex-col py-1 sm:flex-row sm:items-center sm:gap-4">
                  <dt className="eyebrow sm:w-24">{link.label}</dt>
                  <dd className="min-w-0">
                    <a
                      href={link.href}
                      className="link inline-flex min-h-11 items-center break-all sm:min-h-8"
                    >
                      {link.display}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="lg:pt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
