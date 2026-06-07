import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

/** Formatea una fecha larga en español. Ej: "7 de junio de 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
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
