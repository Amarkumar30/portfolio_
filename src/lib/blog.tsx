import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import { renderMdx } from "@/lib/mdx";

const blogDirectory = path.join(process.cwd(), "content", "blog");

const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  date: z
    .union([z.string(), z.date()])
    .transform((value) =>
      value instanceof Date ? value.toISOString().slice(0, 10) : value,
    )
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1),
  draft: z.boolean().optional().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: React.ReactNode;
}

const showDrafts = process.env.NODE_ENV !== "production";

function getPostFiles() {
  return fs.readdirSync(blogDirectory).filter((file) => file.endsWith(".mdx"));
}

function readPost(slug: string) {
  const filePath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  const parsed = blogFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    console.warn(
      `[blog] Skipping ${slug}.mdx: invalid frontmatter\n${z.prettifyError(parsed.error)}`,
    );
    return null;
  }

  if (parsed.data.draft && !showDrafts) {
    return null;
  }

  return { frontmatter: parsed.data, content };
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostFiles()
    .flatMap((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const post = readPost(slug);

      return post
        ? [{ ...post.frontmatter, slug, readingTime: readingTime(post.content).text }]
        : [];
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getAllTags() {
  return Array.from(new Set(getAllPosts().flatMap((post) => post.tags))).sort();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }

  const post = readPost(slug);

  if (!post) {
    return null;
  }

  const { frontmatter, content } = post;

  return {
    ...frontmatter,
    slug,
    readingTime: readingTime(content).text,
    content: await renderMdx(content),
  };
}
