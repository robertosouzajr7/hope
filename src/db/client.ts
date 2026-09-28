// Database connection shared by the app and the startup hook (src/instrumentation.ts).
// Kept free of "server-only" so instrumentation can import it.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

// With DATABASE_URL we talk to Postgres (production). Without it, an embedded
// PGlite database in .data/ is used so the project runs with zero setup.
// Either way, pending migrations and the initial content are applied on connect.
async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  let db: Database;

  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    db = drizzle(new Pool({ connectionString: url, max: 10 }), { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const dataDir = path.join(process.cwd(), ".data", "pglite");
    await mkdir(dataDir, { recursive: true });
    const pglite = drizzle(new PGlite(dataDir), { schema });
    await migrate(pglite, { migrationsFolder: MIGRATIONS });
    // Both drivers expose the same query builder API.
    db = pglite as unknown as Database;
  }

  const { seed } = await import("./seed");
  await seed(db);
  return db;
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
