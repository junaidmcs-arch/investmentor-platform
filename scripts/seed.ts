import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { getPool, transaction } = await import("../src/lib/server/db");
  const { contentEntries } = await import("../src/lib/content");
  const pool = getPool();
  try {
    await transaction(async client => {
      for (const entry of contentEntries) {
        await client.query(`INSERT INTO contents (id,slug,kind,title,excerpt,body,level,category,read_minutes,author,featured,status,published_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PUBLISHED',$12) ON CONFLICT(slug) DO NOTHING`,
          [entry.id,entry.slug,entry.kind,entry.title,entry.excerpt,entry.body,entry.level ?? null,entry.category,entry.readMinutes,entry.author,entry.featured ?? false,entry.publishedAt]);
      }
    });
    console.log("Starter content seeded. Existing articles were preserved.");
  } finally { await pool.end(); }
}
main().catch(() => { console.error("Seed failed. Run database migrations and check configuration."); process.exitCode = 1; });
