import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import { SITE } from "@/lib/constants";
import { Providers } from "@/components/providers";
import { getLocale } from "@/i18n/server";
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

export function generateMetadata(): Metadata {
  const locale = getLocale();
  const ogLocale = locale === "en" ? "en_US" : "es_ES";
  return {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Tienda de vinilos online`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "vinilos",
    "discos de vinilo",
    "tienda de vinilos",
    "tienda de vinilos online",
    "comprar vinilos online",
    "vinilos España",
    "LP",
    "discos de segunda mano",
    "novedades vinilo",
    "ediciones especiales vinilo",
    SITE.name,
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: ogLocale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Tienda de vinilos online`,
    description: SITE.description,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Tienda de vinilos online`,
    description: SITE.description,
    images: ["/og-default.png"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  // Verificación de propiedad. Los tokens se configuran por variable de entorno
  // (ver docs/PROGRESO.md). Si no están, no se emiten las etiquetas.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
      ? {
          "facebook-domain-verification":
            process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION,
        }
      : {},
  },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocale();
  return (
    <html
      lang={locale === "en" ? "en" : "es"}
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
              logo: new URL("/icon.png", SITE.url).toString(),
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
