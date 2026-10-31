import GithubSlugger from "github-slugger";

export interface Heading {
  id: string;
  text: string;
}

/** Turns inline Markdown into the plain text rehype-slug sees: links, emphasis and code removed. */
function plainText(markdown: string) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

/**
 * The h2 headings of an MDX body, with the same ids rehype-slug gives them.
 * Every heading level goes through one slugger in document order (as rehype-slug does), so
 * repeated headings get the same "-1", "-2" suffixes. Code fences are skipped.
 */
export function getH2Headings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let fence: string | null = null;

  for (const line of source.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      fence = fence === null ? fenceMatch[1] : fence === fenceMatch[1] ? null : fence;
      continue;
    }
    if (fence) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const text = plainText(match[2]);
    const id = slugger.slug(text);
    if (match[1].length === 2) headings.push({ id, text });
  }

  return headings;
}
