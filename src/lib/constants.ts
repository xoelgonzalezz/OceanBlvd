// Constantes compartidas de la tienda.

/** Estado nuevo / segunda mano. */
export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  USED: "Segunda mano",
};

/** Gradación del estado del disco (Goldmine Standard). */
export const GRADE_LABELS: Record<string, string> = {
  M: "Mint (M)",
  NM: "Near Mint (NM)",
  "VG+": "Very Good Plus (VG+)",
  VG: "Very Good (VG)",
  "G+": "Good Plus (G+)",
};

export const GRADE_DESCRIPTIONS: Record<string, string> = {
  M: "Perfecto, precintado o sin usar.",
  NM: "Casi perfecto, sin apenas signos de uso.",
  "VG+": "Pequeñas marcas superficiales que no afectan a la reproducción.",
  VG: "Marcas visibles y ligero ruido de fondo en pasajes silenciosos.",
  "G+": "Uso evidente, suena pero con ruido. Pieza de coleccionista.",
};

/** Opciones de ordenación del catálogo. */
export const SORT_OPTIONS = [
  { value: "newest", label: "Novedades" },
  { value: "popular", label: "Más vendidos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "az", label: "Alfabético (A–Z)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Productos por página en el catálogo. */
export const PAGE_SIZE = 12;

/* ---- Reglas de envío ---- */
export const FREE_SHIPPING_THRESHOLD_CENTS = 6000; // envío gratis a partir de 60 €
export const SHIPPING_FLAT_CENTS = 499; // 4,99 € de envío estándar

/** Calcula el coste de envío en céntimos según el subtotal. */
export function calcShipping(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

/** Redes sociales del footer. */
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com" },
  { name: "Spotify", href: "https://spotify.com" },
  { name: "Bandcamp", href: "https://bandcamp.com" },
  { name: "YouTube", href: "https://youtube.com" },
] as const;

export const SITE = {
  name: "Ocean Blvd Vinyl",
  shortName: "Ocean Blvd",
  description:
    "Tienda independiente de discos de vinilo. Novedades, ediciones especiales y joyas de segunda mano cuidadosamente seleccionadas.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
