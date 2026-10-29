import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedContent, getPublishedContents } from "@/lib/server/content";
import { ContentArticle } from "../_components/content-article";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await getPublishedContent((await params).slug);
  return entry?.kind === "lesson" ? { title: entry.title, description: entry.excerpt } : { title: "Lesson not found" };
}
export default async function LessonPage({ params }: Props) {
  const entry = await getPublishedContent((await params).slug);
  if (!entry || entry.kind !== "lesson") notFound();
  const entries = await getPublishedContents("lesson");
  const related = entries.filter(item => item.id !== entry.id).sort((a, b) => Number(b.level === entry.level) - Number(a.level === entry.level)).slice(0, 3);
  return <ContentArticle entry={entry} related={related} />;
}
