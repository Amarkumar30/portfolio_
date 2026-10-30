/**
 * PersonJsonLd injects Person schema to make Amar's identity machine-readable.
 * Used in: home and about pages.
 */
import { JsonLd } from "@/components/seo/json-ld";
import { personStructuredData } from "@/lib/site";

export function PersonJsonLd() {
  return <JsonLd data={personStructuredData} />;
}
