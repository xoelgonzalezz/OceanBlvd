import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import { SITE } from "@/lib/constants";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Discos de vinilo`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "vinilos",
    "discos de vinilo",
    "tienda de vinilos",
    "LP",
    "segunda mano",
    "novedades vinilo",
    SITE.name,
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Discos de vinilo`,
    description: SITE.description,
    images: [{ url: "/placeholders/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Discos de vinilo`,
    description: SITE.description,
    images: ["/placeholders/og-default.svg"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
