/**
 * mdxComponents maps custom React components and styled HTML tags into MDX content.
 * Props: none, exported object consumed by the MDX runtime.
 * Used in: blog post rendering pipeline in src/lib/blog.tsx.
 * TODO: Register more custom components here if future posts need richer embeds.
 */
import Link from "next/link";
import { Callout } from "@/components/mdx/callout";

export const mdxComponents = {
  Callout,
  a: (props: React.ComponentProps<"a">) => (
    <Link
      href={props.href ?? "#"}
      className="text-accent underline decoration-accent/50 underline-offset-4"
    >
      {props.children}
    </Link>
  ),
};
