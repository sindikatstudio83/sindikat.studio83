import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow <img> tags from Supabase Storage (already using plain <img>, not next/image)
  // These patterns are needed if next/image is ever used
  images: {
    remotePatterns: [
      {
        // Supabase Storage — matches any Supabase project URL
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // picsum.photos only needed for dev mock banners — not used in production
      ...(process.env.NODE_ENV !== "production" ? [{
        protocol: "https" as const,
        hostname: "picsum.photos",
      }] : []),
    ],
  },

  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    }
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      },
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
