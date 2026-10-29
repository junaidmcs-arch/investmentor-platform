import { contentEntries, type ContentEntry } from "../content";
import { isDatabaseConfigured, query } from "./db";

export const contentColumns = `id,slug,kind,title,excerpt,body,level,category,read_minutes AS "readMinutes",author,featured,status,
  published_at AS "publishedAt",created_at AS "createdAt",updated_at AS "updatedAt"`;
export function mapContent(row: Record<string, unknown>): ContentEntry {
  return { ...row, publishedAt: row.publishedAt ? new Date(row.publishedAt as string).toISOString() : "", level: row.level ?? undefined } as ContentEntry;
}
export async function getPublishedContents(kind?: ContentEntry["kind"]): Promise<ContentEntry[]> {
  if (!isDatabaseConfigured()) return contentEntries.filter(entry => !kind || entry.kind === kind);
  const result = await query(`SELECT ${contentColumns} FROM contents WHERE status='PUBLISHED' ${kind ? "AND kind=$1" : ""} ORDER BY level NULLS LAST, published_at DESC`, kind ? [kind] : []);
  return result.rows.map(mapContent);
}
export async function getPublishedContent(slug: string): Promise<ContentEntry | null> {
  if (!isDatabaseConfigured()) return contentEntries.find(entry => entry.slug === slug) ?? null;
  const result = await query(`SELECT ${contentColumns} FROM contents WHERE slug=$1 AND status='PUBLISHED'`, [slug]);
  return result.rows[0] ? mapContent(result.rows[0]) : null;
}
