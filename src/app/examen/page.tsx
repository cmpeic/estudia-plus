import type { Metadata } from "next";
import ExamView from "@/components/ExamView";

export const metadata: Metadata = { title: "Simulacro de examen · Estudia+" };

export default function ExamPage() {
  return <ExamView />;
}
