import type { Metadata } from "next";
import { InteresovanjaClient } from "@/components/interesovanja-client";

export const metadata: Metadata = {
  title: "Moja interesovanja",
  robots: { index: false, follow: false },
};

export default function InteresovanjaPage() {
  return <InteresovanjaClient />;
}
