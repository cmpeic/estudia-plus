import type { Metadata } from "next";
import GlossaryView from "@/components/GlossaryView";

export const metadata: Metadata = { title: "Glosario · Estudia+" };

export default function GlossaryPage() {
  return <GlossaryView />;
}
