// Constantes compartidas de la tienda.

/** Estado nuevo / segunda mano. */
export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  USED: "Segunda mano",
};

/** Estado de un pedido (panel de admin y cuenta del cliente). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
};

/** Transportista por defecto de los envíos. */
export const DEFAULT_CARRIER = "Correos";

/**
 * Enlace público al localizador de Correos con el número de seguimiento.
 * Si el parámetro cambia, basta con tocar aquí; el número se muestra siempre
 * aparte para que el cliente pueda copiarlo y pegarlo a mano.
 */
export function correosTrackingUrl(trackingNumber: string): string {
  const base = "https://www.correos.es/es/es/herramientas/localizador/envios";
  return `${base}?tracking-number=${encodeURIComponent(trackingNumber.trim())}`;
}

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

export const GRADE_DESCRIPTIONS_EN: Record<string, string> = {
  M: "Perfect, sealed or unused.",
  NM: "Near perfect, with barely any signs of use.",
  "VG+": "Light surface marks that don't affect playback.",
  VG: "Visible marks and slight background noise in quiet passages.",
  "G+": "Clear wear, plays with noise. A collector's piece.",
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

/* ---- Descuentos ---- */
// Código de bienvenida que se entrega al suscribirse a la newsletter (popup).
export const WELCOME_CODE = "BIENVENIDO10";
export const WELCOME_DISCOUNT_PCT = 0.1; // 10 %

/**
 * Descuento en céntimos para un código sobre un subtotal. Devuelve 0 si el
 * código no es válido. Se evalúa en cliente (vista previa) y en servidor (real).
 */
export function discountForCode(
  code: string | null | undefined,
  subtotalCents: number
): number {
  if (!code) return 0;
  if (code.trim().toUpperCase() === WELCOME_CODE) {
    return Math.round(subtotalCents * WELCOME_DISCOUNT_PCT);
  }
  return 0;
}

/** Redes sociales del footer. Vacío = no se muestran (todavía no hay perfiles). */
export const SOCIAL_LINKS: { name: string; href: string }[] = [];

export const SITE = {
  name: "Ocean Blvd Vinyl",
  shortName: "Ocean Blvd",
  description:
    "Tienda independiente de discos de vinilo. Novedades, ediciones especiales y joyas de segunda mano cuidadosamente seleccionadas.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
