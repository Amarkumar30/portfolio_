import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { compile, run } from "@mdx-js/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";
import { mdxComponents } from "@/components/mdx/mdx-components";

const blogDirectory = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  category: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: React.ReactNode;
}

function getPostFiles() {
  return fs.readdirSync(blogDirectory).filter((file) => file.endsWith(".mdx"));
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostFiles()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const source = fs.readFileSync(path.join(blogDirectory, file), "utf8");
      const { data, content } = matter(source);
      const frontmatter = data as BlogFrontmatter;

      return {
        ...frontmatter,
        slug,
        readingTime: readingTime(content).text,
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getAllTags() {
  return Array.from(new Set(getAllPosts().flatMap((post) => post.tags))).sort();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as BlogFrontmatter;

  const compiled = await compile(content, {
    outputFormat: "function-body",
    development: process.env.NODE_ENV === "development",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
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
        },
      ],
    ],
  });

  const evaluated = await run(compiled, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  const MdxComponent = evaluated.default as ComponentType<{
    components?: typeof mdxComponents;
  }>;

  return {
    ...frontmatter,
    slug,
    readingTime: readingTime(content).text,
    content: <MdxComponent components={mdxComponents} />,
  };
}
