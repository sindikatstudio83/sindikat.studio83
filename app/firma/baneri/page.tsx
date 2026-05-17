import type { Metadata } from "next";
import { FirmaBannerRequestsClient } from "@/components/firma-banner-requests-client";

export const metadata: Metadata = { title: "Banner zahtjevi — Firma panel" };

export default function FirmaBaneriPage() {
  return (
    <div className="app-shell">
      <main style={{ gridColumn: "1 / -1" }}>
        <div style={{ padding: "24px 0 40px" }}>
          <span className="page-label">Firma panel</span>
          <h1>Banner zahtjevi</h1>
          <p className="sub">Pošaljite zahtjev za reklamni banner na platformi.</p>
          <div style={{ marginTop: 20 }}>
            <FirmaBannerRequestsClient />
          </div>
        </div>
      </main>
    </div>
  );
}
