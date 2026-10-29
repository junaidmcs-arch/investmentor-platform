import { loadEnvConfig } from "@next/env";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
loadEnvConfig(process.cwd());

async function main() {
  const { getPool, transaction } = await import("../src/lib/server/db");
  const pool = getPool();
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    const directory = path.join(process.cwd(), "db", "migrations");
    const files = (await readdir(directory)).filter(file => file.endsWith(".sql")).sort();
    for (const file of files) {
      await transaction(async client => {
        await client.query("SELECT pg_advisory_xact_lock(59102743)");
        const done = await client.query("SELECT name FROM schema_migrations WHERE name = $1", [file]);
        if (done.rowCount) return;
        await client.query(await readFile(path.join(directory, file), "utf8"));
        await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [file]);
        console.log(`Applied ${file}`);
      });
    }
    console.log("Database migrations are current.");
  } finally { await pool.end(); }
}
main().catch(() => { console.error("Migration failed. Check database access and migration compatibility. No connection details were logged."); process.exitCode = 1; });
