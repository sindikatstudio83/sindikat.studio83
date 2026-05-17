import type { Metadata } from "next";
import { AdminCreativeTemplatesClient } from "@/components/admin-creative-templates-client";
export const metadata: Metadata = { title: "Canva Templates — Admin" };
export default function AdminTemplatesPage() {
  return (
    <div className="app-shell">
      <main style={{ gridColumn: "1 / -1" }}>
        <div style={{ padding: "24px 0 40px" }}>
          <span className="page-label">Admin</span>
          <h1>Canva Templates</h1>
          <p className="sub">Upravljaj templateima za kreiranje kreativa.</p>
          <div style={{ marginTop: 20 }}>
            <AdminCreativeTemplatesClient />
          </div>
        </div>
      </main>
    </div>
  );
}
