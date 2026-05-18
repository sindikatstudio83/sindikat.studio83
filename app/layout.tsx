import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Fontovi se učitavaju kroz CSS @import u globals.css (browser-side).
// next/font/google zahtijeva mrežni pristup u build fazi — ne radi u svim CI okruženjima.
// Na Vercel-u (produkcija) fontovi se učitavaju normalno putem Google Fonts CDN-a.

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "imaposla.me — Poslovi u Crnoj Gori", template: "%s | imaposla.me" },
  description: "Oglasi za posao, kandidati i poslodavci u Crnoj Gori. Pronađi posao ili objavi oglas.",
  metadataBase: new URL("https://imaposla.me"),
  openGraph: {
    siteName: "imaposla.me",
    locale: "sr_ME",
    type: "website",
    images: [
      {
        url: "/og-image?title=imaposla.me&subtitle=Poslovi+u+Crnoj+Gori",
        width: 1200,
        height: 630,
        alt: "imaposla.me — Poslovi u Crnoj Gori"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "imaposla.me — Poslovi u Crnoj Gori",
    description: "Oglasi za posao, kandidati i poslodavci u Crnoj Gori.",
    images: ["/og-image?title=imaposla.me&subtitle=Poslovi+u+Crnoj+Gori"]
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr-ME" data-theme="light">
      <body>
        <AuthProvider>
          <Header />
          <main className="wrap app">{children}</main>
          <MobileNav />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
