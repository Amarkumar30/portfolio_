/**
 * Where admin writes go.
 * - GitHub (GITHUB_TOKEN set): commits through the GitHub Contents API; the commit to the
 *   deploy branch triggers a Vercel redeploy, so changes go live in ~1–2 minutes.
 * - Local (development without GITHUB_TOKEN): reads and writes the working tree directly.
 * Every path is checked by assertWritablePath before any write or delete.
 * Server-only.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import { assertWritablePath } from "@/lib/admin/paths";

export interface Storage {
  kind: "github" | "local";
  /** File names (not paths) directly inside `dir`. */
  list(dir: string): Promise<string[]>;
  read(filePath: string): Promise<string | null>;
  exists(filePath: string): Promise<boolean>;
  write(filePath: string, content: string | Buffer, message: string): Promise<void>;
  remove(filePath: string, message: string): Promise<void>;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Publishing isn't configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO and GITHUB_BRANCH.",
    );
  }
}

const author = { name: "Amar Kumar", email: "amar.kumar.career@gmail.com" };

function isNotFound(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 404;
}

function githubStorage(): Storage {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER ?? "Amarkumar30";
  const repo = process.env.GITHUB_REPO ?? "portfolio_";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  async function getFile(filePath: string) {
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
      return Array.isArray(data) || data.type !== "file" ? null : data;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  return {
    kind: "github",
    async list(dir) {
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: dir, ref: branch });
        return Array.isArray(data) ? data.filter((item) => item.type === "file").map((item) => item.name) : [];
      } catch (error) {
        if (isNotFound(error)) return [];
        throw error;
      }
    },
    async read(filePath) {
      const file = await getFile(filePath);
      return file && "content" in file ? Buffer.from(file.content, "base64").toString("utf8") : null;
    },
    async exists(filePath) {
      return (await getFile(filePath)) !== null;
    },
    async write(filePath, content, message) {
      assertWritablePath(filePath);
      const existing = await getFile(filePath);
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch,
        path: filePath,
        message,
        content: Buffer.from(content).toString("base64"),
        sha: existing?.sha,
        author,
        committer: author,
      });
    },
    async remove(filePath, message) {
      assertWritablePath(filePath);
      const existing = await getFile(filePath);
      if (!existing) return;
      await octokit.repos.deleteFile({
        owner,
        repo,
        branch,
        path: filePath,
        message,
        sha: existing.sha,
        author,
        committer: author,
      });
    },
  };
}

function localStorage(): Storage {
  const root = process.cwd();
  // Dev-only and validated by assertWritablePath on writes; don't let the bundler trace it.
  const resolve = (filePath: string) =>
    path.join(/* turbopackIgnore: true */ root, ...filePath.split("/"));

  return {
    kind: "local",
    async list(dir) {
      try {
        const items = await fs.readdir(resolve(dir), { withFileTypes: true });
        return items.filter((item) => item.isFile()).map((item) => item.name);
      } catch {
        return [];
      }
    },
    async read(filePath) {
      try {
        return await fs.readFile(resolve(filePath), "utf8");
      } catch {
        return null;
      }
    },
    async exists(filePath) {
      try {
        await fs.access(resolve(filePath));
        return true;
      } catch {
        return false;
      }
    },
    async write(filePath, content) {
      assertWritablePath(filePath);
      await fs.mkdir(path.dirname(resolve(filePath)), { recursive: true });
      await fs.writeFile(resolve(filePath), content);
    },
    async remove(filePath) {
      assertWritablePath(filePath);
      await fs.rm(resolve(filePath), { force: true });
    },
  };
}

export function getStorage(): Storage {
  if (process.env.GITHUB_TOKEN) {
    return githubStorage();
  }

  if (process.env.NODE_ENV === "development") {
    return localStorage();
  }

  throw new StorageNotConfiguredError();
}
