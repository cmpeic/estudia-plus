import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOPICS, getTopic } from "@/content";
import TopicView from "@/components/TopicView";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/tema/[id]">): Promise<Metadata> {
  const { id } = await params;
  const t = getTopic(id);
  return { title: t ? `${t.title} · Estudia+` : "Tema · Estudia+", description: t?.short };
}

export default async function TopicPage({ params }: PageProps<"/tema/[id]">) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();
  return <TopicView topicId={topic.id} />;
}
