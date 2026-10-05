import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Inter, Lora } from "next/font/google";
import { siteConfig } from "@/lib/config/site";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Lora({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: `${siteConfig.name} — Rencontre musulmane sérieuse pour le mariage`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.name, url: appUrl },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { themeColor: siteConfig.colors.primary, width: "device-width", initialScale: 1 };

const brandVars = {
  "--brand-primary": siteConfig.colors.primary,
  "--brand-primary-light": siteConfig.colors.primaryLight,
  "--brand-gold": siteConfig.colors.gold,
  "--brand-cream": siteConfig.colors.cream,
  "--brand-muted": siteConfig.colors.muted,
  "--brand-ink": siteConfig.colors.ink,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${body.variable} ${display.variable}`} style={brandVars}>
      <body className="min-h-dvh">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
