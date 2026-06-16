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
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Discos de vinilo`,
    description: SITE.description,
    images: ["/og-default.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              "@id": `${SITE.url}/#store`,
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              logo: new URL("/icon.svg", SITE.url).toString(),
              image: new URL("/og-default.png", SITE.url).toString(),
              areaServed: "ES",
              priceRange: "€€",
              // Cuando tengas perfiles reales, añade aquí sus URLs (ayuda mucho
              // a que Google asocie la marca): sameAs: ["https://instagram.com/..."]
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE.url}/tienda?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
