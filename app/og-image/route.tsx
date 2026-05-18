import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "imaposla.me";
  const subtitle = searchParams.get("subtitle") || "Poslovi u Crnoj Gori";

  const safeTitle = title.length > 50 ? title.slice(0, 50) + "\u2026" : title;
  const safeSubtitle = subtitle.length > 90 ? subtitle.slice(0, 90) + "\u2026" : subtitle;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#0a0e14",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <div
        style={{
          margin: "40px",
          flex: 1,
          background: "#1a1f2e",
          borderRadius: "32px",
          border: "2px solid #252b3a",
          display: "flex",
          flexDirection: "column",
          padding: "50px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              background: "#c8ff3d",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 900,
              color: "#0a0e14",
            }}
          >
            ip
          </div>
          <span style={{ fontSize: "26px", fontWeight: 700, color: "#e8eef5" }}>
            imaposla.me
          </span>
        </div>
        <div
          style={{
            fontSize: "60px",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {safeTitle}
        </div>
        <div
          style={{
            fontSize: "26px",
            color: "#9aa5b8",
            marginBottom: "16px",
            marginTop: "24px",
          }}
        >
          {safeSubtitle}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#c8ff3d",
            fontWeight: 700,
          }}
        >
          imaposla.me
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
