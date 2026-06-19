import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Serializa datos para un <script type="application/ld+json"> escapando '<'. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Hosts de imagen permitidos por next.config (remotePatterns). Si una portada
// viene de otro dominio, next/image lanza un error y ROMPE la página entera
// (error 500). Por eso validamos y, si no es válida, caemos a un placeholder.
const ALLOWED_IMG_HOSTS = [
  /(^|\.)mzstatic\.com$/,
  /(^|\.)dzcdn\.net$/,
  /^upload\.wikimedia\.org$/,
  /(^|\.)scdn\.co$/,
  /^m\.media-amazon\.com$/,
  /^images-na\.ssl-images-amazon\.com$/,
  /^i\.discogs\.com$/,
  /^coverartarchive\.org$/,
];

/**
 * Devuelve una `src` segura para <Image>: acepta rutas locales ("/...") o URLs
 * de hosts permitidos; en cualquier otro caso devuelve el `fallback`. Evita el
 * 500 cuando una portada usa un dominio no listado en remotePatterns.
 */
export function safeImg(src: string | null | undefined, fallback: string): string {
  if (!src) return fallback;
  if (src.startsWith("/")) return src;
  try {
    const host = new URL(src).hostname;
    return ALLOWED_IMG_HOSTS.some((re) => re.test(host)) ? src : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Formatea un precio almacenado en céntimos a euros con el formato español.
 * Ej: 1299 -> "12,99 €"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Formatea una fecha larga según el idioma. Ej: "7 de junio de 2026" / "7 June 2026" */
export function formatDate(date: Date | string, locale: string = "es"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Crea un slug URL-friendly a partir de un texto. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Devuelve la década (1970, 1980...) de un año dado. */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** Etiqueta legible de una década. Ej: 1970 -> "Años 70" */
export function decadeLabel(decade: number): string {
  return `Años ${decade.toString().slice(2)}`;
}

/** Trunca un texto a un número máximo de caracteres respetando palabras. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).trimEnd() + "…";
}

/** Pluraliza de forma sencilla en español. */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
