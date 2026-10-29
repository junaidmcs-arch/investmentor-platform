import { describe, expect, it } from "vitest";
import { contentEntries, contentPath } from "../src/lib/content";

describe("launch educational content", () => {
  it("uses unique database-safe identifiers and slugs", () => {
    expect(new Set(contentEntries.map(entry => entry.id)).size).toBe(contentEntries.length);
    expect(new Set(contentEntries.map(entry => entry.slug)).size).toBe(contentEntries.length);
    for (const entry of contentEntries) {
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(entry.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(Number.isNaN(new Date(entry.publishedAt).getTime())).toBe(false);
    }
  });
  it("has working destinations for every internal learning link", () => {
    const knownPaths = new Set(["/learn", "/tools/valuation", "/ask", "/sessions", ...contentEntries.map(contentPath)]);
    for (const entry of contentEntries) {
      const links = [...entry.body.matchAll(/\]\((\/[^)]+)\)/g)].map(match => match[1]);
      for (const link of links) expect(knownPaths.has(link), `${entry.slug} links to ${link}`).toBe(true);
    }
  });
  it("covers the complete learning framework and identifies fictional studies", () => {
    expect([...new Set(contentEntries.filter(entry => entry.kind === "lesson").map(entry => entry.level))].sort()).toEqual([1, 2, 3, 4, 5]);
    for (const entry of contentEntries.filter(entry => entry.kind === "study")) expect(entry.body.toLowerCase()).toContain("fictional");
    for (const entry of contentEntries.filter(entry => entry.kind === "faq")) expect(contentPath(entry)).toBe(`/learn#${entry.slug}`);
  });
});
