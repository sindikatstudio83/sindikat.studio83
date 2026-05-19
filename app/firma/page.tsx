import type { Metadata } from "next";
import { CompanyClient } from "@/components/company-client";

export const metadata: Metadata = { title: "Pregled firme" };

export default function FirmaDashboardPage() {
  return <CompanyClient view="dashboard" />;
}
