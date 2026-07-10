/**
 * PersonJsonLd injects Person schema to improve machine-readable identity signals.
 * Props: none.
 * Used in: home and about pages where search systems benefit from explicit author/profile context.
 * TODO: Expand with a personal website or organization fields if your public footprint grows.
 */
import { personStructuredData } from "@/lib/site";

export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
    />
  );
}
