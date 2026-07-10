/**
 * Contact page offers a direct outreach form plus profile links with no fabricated social proof.
 * Props: none for the route component.
 * Used in: /contact route.
 * TODO: Add more contact surfaces only when they are real and intentionally public.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent, socialLinks } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Amar Kumar for internships, software engineering roles, collaborations, or conversations around GEO, startups, and developer-focused products.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-shell space-y-12 py-10 sm:py-14">
      <Reveal className="section-card p-8 sm:p-10">
        <SectionHeading
          eyebrow="Contact"
          title="Reach out for internships, product roles, or interesting conversations."
          description="No fake testimonials, no invented logos, and no filler. Just a direct way to get in touch."
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <div className="space-y-6">
          <Reveal className="section-card p-6">
            <h2 className="font-heading text-2xl font-semibold">Direct links</h2>
            <div className="mt-5 flex flex-col gap-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm leading-7 text-muted hover:text-accent"
                >
                  <span className="font-semibold text-foreground">{link.label}:</span>{" "}
                  {link.display}
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal className="section-card p-6" delay={0.08}>
            <h2 className="font-heading text-2xl font-semibold">Profile note</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{siteContent.contactNote}</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
