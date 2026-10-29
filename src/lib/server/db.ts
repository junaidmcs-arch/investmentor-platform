import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalDb = globalThis as unknown as { investmentorPool?: Pool };
export function isDatabaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export function getPool(): Pool {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_UNAVAILABLE");
  if (!globalDb.investmentorPool) {
    globalDb.investmentorPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ...(process.env.DATABASE_CA_CERT ? { ssl: { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, "\n") } } : {}),
    });
  }
  return globalDb.investmentorPool;
}
export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {
  return getPool().query<T>(sql, values);
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try { await client.query("BEGIN"); const value = await work(client); await client.query("COMMIT"); return value; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
