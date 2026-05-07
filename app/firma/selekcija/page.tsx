import type { Metadata } from "next";
import { CompanyClient } from "@/components/company-client";

export const metadata: Metadata = { title: "Selekcija prijava" };

export default function SelekcijaPage() {
  return <CompanyClient view="selection" />;
}
