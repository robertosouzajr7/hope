import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

// With DATABASE_URL we talk to Postgres (production). Without it, an embedded
// PGlite database in .data/ is used so the project runs locally with zero setup.
async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 5 });
    return drizzlePg(pool, { schema });
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  const { seed } = await import("./seed");
  // Both drivers expose the same query builder API.
  await seed(db as unknown as Database);
  return db as unknown as Database;
}

const globalForDb = globalThis as unknown as { __vhDb?: Promise<Database> };

export function getDb() {
  globalForDb.__vhDb ??= connect().catch((error) => {
    globalForDb.__vhDb = undefined;
    throw error;
  });
  return globalForDb.__vhDb;
}

export { schema };
