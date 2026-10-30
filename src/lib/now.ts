import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMdx } from "@/lib/mdx";

const nowFile = path.join(process.cwd(), "content", "now.mdx");

export async function getNow() {
  if (!fs.existsSync(nowFile)) {
    return null;
  }

  const { data, content } = matter(fs.readFileSync(nowFile, "utf8"));
  const updated = typeof data.updated === "string" ? data.updated : null;

  return { updated, content: await renderMdx(content) };
}
