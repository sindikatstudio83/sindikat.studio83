import type { Metadata } from "next";
import { BrziKontaktiClient } from "@/components/brzi-kontakti-client";

export const metadata: Metadata = {
  title: "Moji kontakti",
  robots: { index: false, follow: false },
};

export default function BrziKontaktiPage() {
  return <BrziKontaktiClient />;
}
