/**
 * mdxComponents maps custom React components and styled HTML tags into MDX content.
 * Props: none, exported object consumed by the MDX runtime.
 * Used in: the MDX rendering pipeline in src/lib/mdx.tsx.
 */
import Link from "next/link";
import { Callout } from "@/components/mdx/callout";

export const mdxComponents = {
  Callout,
  a: ({ href = "#", children, ...props }: React.ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
};
