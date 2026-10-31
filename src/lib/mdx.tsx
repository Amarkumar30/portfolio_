import { compile, run } from "@mdx-js/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";
import { mdxComponents } from "@/components/mdx/mdx-components";

export function compileMdx(source: string) {
  return compile(source, {
    outputFormat: "function-body",
    development: process.env.NODE_ENV === "development",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          // Wrap the heading text so the anchor link has an accessible name.
          behavior: "wrap",
          properties: {
            className: ["anchor-heading"],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark-dimmed",
            light: "github-light",
          },
          // The code block surface comes from the site tokens, not the Shiki theme.
          keepBackground: false,
        },
      ],
    ],
  });
}

export async function renderMdx(source: string) {
  const compiled = await compileMdx(source);
  const evaluated = await run(compiled, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  const MdxComponent = evaluated.default as ComponentType<{
    components?: typeof mdxComponents;
  }>;

  return <MdxComponent components={mdxComponents} />;
}
