import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: { default: "imaposla.me — Poslovi u Crnoj Gori", template: "%s | imaposla.me" },
  description: "Oglasi za posao, kandidati i poslodavci u Crnoj Gori. Pronađi posao ili objavi oglas.",
  metadataBase: new URL("https://imaposla.me"),
  openGraph: { siteName: "imaposla.me", locale: "sr_ME", type: "website" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr-ME" data-theme="light" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
