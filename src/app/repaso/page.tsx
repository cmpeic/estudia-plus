import type { Metadata } from "next";
import ReviewView from "@/components/ReviewView";

export const metadata: Metadata = { title: "Repaso · Estudia+" };

export default function ReviewPage() {
  return <ReviewView />;
}
