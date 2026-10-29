import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedContent, getPublishedContents } from "@/lib/server/content";
import { ContentArticle } from "../../learn/_components/content-article";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> { const entry = await getPublishedContent((await params).slug); return entry?.kind === "study" ? { title: entry.title, description: entry.excerpt } : { title: "Study not found" }; }
export default async function StudyPage({ params }: Props) {
  const entry = await getPublishedContent((await params).slug);
  if (!entry || entry.kind !== "study") notFound();
  const lessons = await getPublishedContents("lesson");
  return <ContentArticle entry={entry} related={lessons.filter(item => item.level === 2 || item.level === 3).slice(0, 3)} />;
}
