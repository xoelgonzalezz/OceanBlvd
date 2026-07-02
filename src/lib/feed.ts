// Utilidades para los feeds de producto (Google Merchant, catálogo de Meta) y
// el RSS del blog. Sin dependencias externas.

import { SITE } from "@/lib/constants";
import type { RecordCard } from "@/types";

/** Convierte una ruta ("/producto/x") en URL absoluta con el dominio del sitio. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, SITE.url).toString();
}

/** Escapa texto para insertarlo en XML. */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Texto plano en una sola línea, recortado (descripciones de feed). */
export function plainText(value: string, max = 5000): string {
  const s = value.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** URL pública de la ficha de producto. */
export function productLink(slug: string): string {
  return absoluteUrl(`/producto/${slug}`);
}

/**
 * Imagen principal del disco en URL absoluta. Evita SVG (los feeds los rechazan)
 * cayendo a la OG por defecto (PNG) cuando no hay foto real.
 */
export function productImage(record: RecordCard): string {
  const first = record.images[0]?.url;
  if (first && !/\.svg($|\?)/i.test(first)) return absoluteUrl(first);
  return absoluteUrl("/og-default.png");
}

/** Precio en formato de feed: "35.99 EUR". */
export function feedPrice(priceCents: number): string {
  return `${(priceCents / 100).toFixed(2)} EUR`;
}

/** Disponibilidad Google Merchant. */
export function googleAvailability(stock: number): string {
  return stock > 0 ? "in_stock" : "out_of_stock";
}

/** Disponibilidad catálogo de Meta. */
export function metaAvailability(stock: number): string {
  return stock > 0 ? "in stock" : "out of stock";
}

/** Estado del producto (new/used) para ambos feeds. */
export function feedCondition(condition: string): "new" | "used" {
  return condition === "NEW" ? "new" : "used";
}

/** Categoría fija de Google Product Category para vinilos. */
export const GOOGLE_PRODUCT_CATEGORY =
  "Media > Music & Sound Recordings > Records & LPs";
