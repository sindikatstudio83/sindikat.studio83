import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Agresivno keširanje statičnih stranica
  experimental: {
    staleTimes: {
      dynamic: 30,   // dinamičke rute keširati 30s
      static: 180,   // statičke 3 minute
    }
  },

  // HTTP headers za cache
  async headers() {
    return [
      {
        source: "/(oglasi|firme|gradovi|kategorije)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" }
        ]
      },
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=120" }
        ]
      }
    ];
  }
};

export default nextConfig;
