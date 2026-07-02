import { NextResponse } from "next/server";

import { getCatalogForFeed } from "@/lib/queries";
import { SITE, SHIPPING_FLAT_CENTS } from "@/lib/constants";
import {
  GOOGLE_PRODUCT_CATEGORY,
  feedCondition,
  feedPrice,
  googleAvailability,
  plainText,
  productImage,
  productLink,
  xmlEscape,
} from "@/lib/feed";

export const runtime = "nodejs";
// Se regenera bajo demanda con caché de 1 hora (evita golpear la BD en cada
// rastreo de Google). La invalidación total ocurre igualmente cada hora.
export const revalidate = 3600;

/**
 * Feed de Google Merchant Center (RSS 2.0 con espacio de nombres g:).
 * Habilita las fichas gratuitas de Google Shopping. Los discos de segunda mano
 * salen con condition=used (campo crítico de este catálogo).
 */
export async function GET() {
  const records = await getCatalogForFeed();
  const shipping = (SHIPPING_FLAT_CENTS / 100).toFixed(2);

  const items = records
    .map((r) => {
      const brand = r.artist.name;
      const parts = [
        `<item>`,
        `<g:id>${xmlEscape(r.id)}</g:id>`,
        `<g:title>${xmlEscape(plainText(`${r.artist.name} – ${r.title} (Vinilo)`, 150))}</g:title>`,
        `<g:description>${xmlEscape(plainText(r.description, 5000))}</g:description>`,
        `<g:link>${xmlEscape(productLink(r.slug))}</g:link>`,
        `<g:image_link>${xmlEscape(productImage(r))}</g:image_link>`,
        `<g:availability>${googleAvailability(r.stock)}</g:availability>`,
        `<g:price>${feedPrice(r.priceCents)}</g:price>`,
        `<g:condition>${feedCondition(r.condition)}</g:condition>`,
        `<g:brand>${xmlEscape(brand)}</g:brand>`,
        // Sin código de barras: se lo decimos explícitamente a Google.
        `<g:identifier_exists>no</g:identifier_exists>`,
        `<g:google_product_category>${xmlEscape(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
        `<g:product_type>${xmlEscape(`Vinilos > ${r.genre.name}`)}</g:product_type>`,
        `<g:shipping>` +
          `<g:country>ES</g:country>` +
          `<g:service>Estándar</g:service>` +
          `<g:price>${shipping} EUR</g:price>` +
          `</g:shipping>`,
        `</item>`,
      ];
      return parts.join("");
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
    `<channel>` +
    `<title>${xmlEscape(SITE.name)}</title>` +
    `<link>${xmlEscape(SITE.url)}</link>` +
    `<description>${xmlEscape("Catálogo de vinilos de " + SITE.name)}</description>` +
    items +
    `</channel>` +
    `</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
