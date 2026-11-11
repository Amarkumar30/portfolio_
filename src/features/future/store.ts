/**
 * Where events live. Never in the repo.
 * - Redis (Upstash) when its env vars are set: production, and preview deploys connected to it.
 * - A git-ignored JSON file outside production, for local development and tests.
 * - Nothing in production without Redis: getFutureStore() returns null and the page says so.
 * Server-only.
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { LOCAL_DATA_FILE, REDIS_KEY } from "./config";
import { eventSchema, type EventInput, type FutureEvent } from "./schema";

export interface FutureStore {
  kind: "redis" | "file";
  list(): Promise<FutureEvent[]>;
  get(id: string): Promise<FutureEvent | null>;
  /** Saves many at once (used by import); replaces events with the same id. */
  putMany(events: FutureEvent[]): Promise<void>;
  remove(id: string): Promise<boolean>;
}

/** Stored values that don't validate are skipped and logged, never shown half-broken. */
function parseStored(id: string, value: unknown): FutureEvent | null {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) console.warn(`[future] skipping invalid event ${id}`);
  return parsed.success ? parsed.data : null;
}

export function redisStore(redis: Redis): FutureStore {
  return {
    kind: "redis",
    async list() {
      const all = (await redis.hgetall<Record<string, unknown>>(REDIS_KEY)) ?? {};
      return Object.entries(all).flatMap(([id, value]) => parseStored(id, value) ?? []);
    },
    async get(id) {
      const value = await redis.hget(REDIS_KEY, id);
      return value === null || value === undefined ? null : parseStored(id, value);
    },
    async putMany(events) {
      if (events.length === 0) return;
      await redis.hset(REDIS_KEY, Object.fromEntries(events.map((event) => [event.id, JSON.stringify(event)])));
    },
    async remove(id) {
      return (await redis.hdel(REDIS_KEY, id)) > 0;
    },
  };
}

export function fileStore(filePath: string): FutureStore {
  // Writes are queued so two quick saves can't overwrite each other.
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<Record<string, unknown>> {
    try {
      return JSON.parse(await fs.readFile(filePath, "utf8")) as Record<string, unknown>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  function update(change: (all: Record<string, unknown>) => void) {
    const run = queue.then(async () => {
      const all = await read();
      change(all);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const temporary = `${filePath}.${process.pid}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(all, null, 2)}\n`);
      await fs.rename(temporary, filePath);
    });
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    kind: "file",
    async list() {
      return Object.entries(await read()).flatMap(([id, value]) => parseStored(id, value) ?? []);
    },
    async get(id) {
      const value = (await read())[id];
      return value === undefined ? null : parseStored(id, value);
    },
    async putMany(events) {
      await update((all) => {
        for (const event of events) all[event.id] = event;
      });
    },
    async remove(id) {
      let removed = false;
      await update((all) => {
        removed = id in all;
        delete all[id];
      });
      return removed;
    },
  };
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function getFutureStore(): FutureStore | null {
  const redis = redisConfig();
  if (redis) return redisStore(new Redis(redis));
  if (process.env.NODE_ENV === "production") return null;

  // Dev-only and git-ignored; don't let the bundler trace it.
  const file = process.env.FUTURE_DATA_FILE ?? LOCAL_DATA_FILE;
  return fileStore(path.resolve(/* turbopackIgnore: true */ process.cwd(), file));
}

export function newEvent(input: EventInput, now = new Date()): FutureEvent {
  const timestamp = now.toISOString();
  return { ...input, id: randomUUID(), createdAt: timestamp, updatedAt: timestamp };
}

export function updatedEvent(existing: FutureEvent, input: EventInput, now = new Date()): FutureEvent {
  return { ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: now.toISOString() };
}
