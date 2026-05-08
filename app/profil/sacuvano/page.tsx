import type { Metadata } from "next";
import { SavedJobsClient } from "@/components/saved-jobs-client";

export const metadata: Metadata = {
  title: "Sačuvani oglasi",
  robots: { index: false, follow: false }
};

export default function SacuvanoPage() {
  return <SavedJobsClient />;
}
