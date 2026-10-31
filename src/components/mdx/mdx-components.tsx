/**
 * mdxComponents maps custom React components and styled HTML tags into MDX content.
 * - Internal links use next/link.
 * - Code blocks get a copy button; tables scroll horizontally on narrow screens.
 * - Images with a title (![alt](src "Caption")) get a visible caption.
 * Used in: the MDX rendering pipeline in src/lib/mdx.tsx.
 */
import Link from "next/link";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";

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
  figure: (props: React.ComponentProps<"figure">) =>
    "data-rehype-pretty-code-figure" in props ? <CodeBlock {...props} /> : <figure {...props} />,
  table: (props: React.ComponentProps<"table">) => (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  ),
  // Images sit inside a <p> in Markdown, so the caption wrapper uses spans to stay valid HTML.
  img: ({ title, alt = "", ...props }: React.ComponentProps<"img">) => (
    <span className="block">
      {/* eslint-disable-next-line @next/next/no-img-element -- MDX images have unknown sizes. */}
      <img alt={alt} loading="lazy" decoding="async" {...props} />
      {title ? <span className="img-caption block">{title}</span> : null}
    </span>
  ),
};
