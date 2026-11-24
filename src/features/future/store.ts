/**
 * Where planner data lives. Never in the repo.
 * - Redis (Upstash) when its env vars are set: production, and preview deploys connected to it.
 * - Git-ignored JSON files outside production, for local development and tests.
 * - Nothing in production without Redis: the getters return null and the page says so.
 * Events stay under `future:events` as before; tasks, goals and notes have their own hashes.
 * Server-only.
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { z } from "zod";
import { LOCAL_DATA_FILE, REDIS_KEY } from "./config";
import { goalSchema, noteSchema, taskSchema, type DayNote, type Goal, type Task } from "./planner-schema";
import { eventSchema, type EventInput, type FutureEvent } from "./schema";

/** A hash of id → JSON value, in Redis or in a local file. */
export interface Collection<T> {
  kind: "redis" | "file";
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  /** Saves many at once; replaces rows with the same id. */
  putMany(items: T[]): Promise<void>;
  remove(id: string): Promise<boolean>;
}

export type FutureStore = Collection<FutureEvent>;

interface Shape<T> {
  label: string;
  schema: z.ZodType<T>;
  idOf: (item: T) => string;
}

/** Stored values that don't validate are skipped and logged, never shown half-broken. */
function parseStored<T>(shape: Shape<T>, id: string, value: unknown): T | null {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }

  const parsed = shape.schema.safeParse(raw);
  if (!parsed.success) console.warn(`[future] skipping invalid ${shape.label} ${id}`);
  return parsed.success ? parsed.data : null;
}

function redisCollection<T>(redis: Redis, key: string, shape: Shape<T>): Collection<T> {
  return {
    kind: "redis",
    async list() {
      const all = (await redis.hgetall<Record<string, unknown>>(key)) ?? {};
      return Object.entries(all).flatMap(([id, value]) => parseStored(shape, id, value) ?? []);
    },
    async get(id) {
      const value = await redis.hget(key, id);
      return value === null || value === undefined ? null : parseStored(shape, id, value);
    },
    async putMany(items) {
      if (items.length === 0) return;
      await redis.hset(key, Object.fromEntries(items.map((item) => [shape.idOf(item), JSON.stringify(item)])));
    },
    async remove(id) {
      return (await redis.hdel(key, id)) > 0;
    },
  };
}

// One write queue per file, so two quick saves can't overwrite each other.
const queues = new Map<string, Promise<unknown>>();

function fileCollection<T>(filePath: string, shape: Shape<T>): Collection<T> {
  async function read(): Promise<Record<string, unknown>> {
    try {
      return JSON.parse(await fs.readFile(filePath, "utf8")) as Record<string, unknown>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  function update(change: (all: Record<string, unknown>) => void) {
    const run = (queues.get(filePath) ?? Promise.resolve()).then(async () => {
      const all = await read();
      change(all);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const temporary = `${filePath}.${process.pid}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(all, null, 2)}\n`);
      await fs.rename(temporary, filePath);
    });
    queues.set(filePath, run.catch(() => undefined));
    return run;
  }

  return {
    kind: "file",
    async list() {
      return Object.entries(await read()).flatMap(([id, value]) => parseStored(shape, id, value) ?? []);
    },
    async get(id) {
      const value = (await read())[id];
      return value === undefined ? null : parseStored(shape, id, value);
    },
    async putMany(items) {
      await update((all) => {
        for (const item of items) all[shape.idOf(item)] = item;
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

const EVENT: Shape<FutureEvent> = { label: "event", schema: eventSchema, idOf: (item) => item.id };
const TASK: Shape<Task> = { label: "task", schema: taskSchema, idOf: (item) => item.id };
const GOAL: Shape<Goal> = { label: "goal", schema: goalSchema, idOf: (item) => item.id };
const NOTE: Shape<DayNote> = { label: "note", schema: noteSchema, idOf: (item) => item.date };

export function redisStore(redis: Redis): FutureStore {
  return redisCollection(redis, REDIS_KEY, EVENT);
}

export function fileStore(filePath: string): FutureStore {
  return fileCollection(filePath, EVENT);
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export interface PlannerStores {
  kind: "redis" | "file";
  events: Collection<FutureEvent>;
  tasks: Collection<Task>;
  goals: Collection<Goal>;
  notes: Collection<DayNote>;
}

export function getPlannerStores(): PlannerStores | null {
  const redis = redisConfig();

  if (redis) {
    const client = new Redis(redis);
    return {
      kind: "redis",
      events: redisCollection(client, REDIS_KEY, EVENT),
      tasks: redisCollection(client, `${REDIS_KEY.replace(/:events$/, "")}:tasks`, TASK),
      goals: redisCollection(client, `${REDIS_KEY.replace(/:events$/, "")}:goals`, GOAL),
      notes: redisCollection(client, `${REDIS_KEY.replace(/:events$/, "")}:notes`, NOTE),
    };
  }

  if (process.env.NODE_ENV === "production") return null;

  // Dev-only and git-ignored; don't let the bundler trace it.
  const events = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.FUTURE_DATA_FILE ?? LOCAL_DATA_FILE);
  const sibling = (name: string) => events.replace(/\.json$/, `-${name}.json`);

  return {
    kind: "file",
    events: fileCollection(events, EVENT),
    tasks: fileCollection(sibling("tasks"), TASK),
    goals: fileCollection(sibling("goals"), GOAL),
    notes: fileCollection(sibling("notes"), NOTE),
  };
}

export function getFutureStore(): FutureStore | null {
  return getPlannerStores()?.events ?? null;
}

export function newEvent(input: EventInput, now = new Date()): FutureEvent {
  const timestamp = now.toISOString();
  return { ...input, id: randomUUID(), createdAt: timestamp, updatedAt: timestamp };
}

export function updatedEvent(existing: FutureEvent, input: EventInput, now = new Date()): FutureEvent {
  return { ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: now.toISOString() };
}
