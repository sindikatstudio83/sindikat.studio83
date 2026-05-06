import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "imaposla.me — Poslovi u Crnoj Gori", template: "%s | imaposla.me" },
  description: "Oglasi za posao, kandidati i poslodavci u Crnoj Gori. Pronađi posao ili objavi oglas.",
  keywords: ["posao", "oglasi za posao", "zapošljavanje", "Crna Gora", "Podgorica"],
  metadataBase: new URL("https://imaposla.me"),
  openGraph: { siteName: "imaposla.me", locale: "sr_ME", type: "website" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr-ME" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main className="wrap app">{children}</main>
        <MobileNav />
        <Footer />
      </body>
    </html>
  );
}
