// Applies pending migrations and seeds an empty database without starting the
// site. Optional: the server already does this on startup (src/instrumentation.ts).
import path from "node:path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[db] DATABASE_URL não definida — usando banco local embutido (sem migração no build).");
    return;
  }
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const schema = await import("../src/db/schema");
  const { seed } = await import("../src/db/seed");

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("[db] ✓ Migrações aplicadas");
  await seed(db, { log: true });
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
