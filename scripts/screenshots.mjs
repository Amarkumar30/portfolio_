#!/usr/bin/env node
/**
 * Full-page screenshots of every public route (plus /admin/login) at four widths, light and dark.
 *
 *   npm run build && npm run start          # in one terminal
 *   node scripts/screenshots.mjs [label]    # in another; label defaults to "current"
 *
 * Output: screenshots/<label>/<route>__<width>__<theme>.png (git-ignored).
 * Options (env): BASE_URL (default http://localhost:3000), WIDTHS (e.g. "360,1280"),
 * ROUTES (comma-separated paths), CHROME_CHANNEL (default "chrome"; set to "" to use
 * Playwright's bundled Chromium after `npx playwright install chromium`).
 */
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const label = process.argv[2] ?? "current";
const outDir = path.join(root, "screenshots", label);
const widths = (process.env.WIDTHS ?? "360,768,1280,1536").split(",").map(Number);
const themes = ["light", "dark"];

async function slugs(section) {
  const files = await readdir(path.join(root, "content", section)).catch(() => []);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}

async function routes() {
  if (process.env.ROUTES) return process.env.ROUTES.split(",");

  const projects = await slugs("projects");
  const posts = await slugs("blog");
  const research = await slugs("research");

  return [
    "/",
    "/about",
    "/projects",
    ...projects.map((slug) => `/projects/${slug}`),
    "/research",
    ...research.map((slug) => `/research/${slug}`),
    "/blog",
    ...posts.slice(0, 1).map((slug) => `/blog/${slug}`),
    "/notes",
    "/now",
    "/contact",
    "/this-page-does-not-exist",
    "/admin/login",
  ];
}

function fileName(route, width, theme) {
  const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "_");
  return `${name}__${width}__${theme}.png`;
}

const channel = process.env.CHROME_CHANNEL ?? "chrome";
const browser = await chromium.launch(channel ? { channel } : {});
await mkdir(outDir, { recursive: true });

const list = await routes();
let count = 0;

for (const theme of themes) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: theme,
      reducedMotion: "reduce",
    });
    // next-themes reads this before paint, so the first frame is already in the right theme.
    await context.addInitScript((value) => {
      try {
        localStorage.setItem("theme", value);
      } catch {}
    }, theme);
    const page = await context.newPage();

    for (const route of list) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(outDir, fileName(route, width, theme)), fullPage: true });
      count += 1;
    }

    await context.close();
  }
}

await browser.close();
console.log(`Saved ${count} screenshots to ${path.relative(root, outDir)}/`);
