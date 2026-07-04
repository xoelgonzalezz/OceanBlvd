import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  getDictionary,
  LOCALES,
  type Locale,
} from "@/i18n/dictionary";

export const LOCALE_COOKIE = "locale";

/** Lee el idioma actual de la cookie (servidor). */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value as Locale | undefined;
  return value && LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

/** Diccionario de la interfaz para el idioma actual. */
export function getDict() {
  return getDictionary(getLocale());
}

/**
 * "N disco / N discos" — "N record / N records", con pluralización real por
 * idioma (Intl.PluralRules), no concatenando la forma plural a pelo.
 */
export function recordsLabel(n: number): string {
  const locale = getLocale();
  const t = getDictionary(locale);
  const rule = new Intl.PluralRules(locale).select(n);
  const word = rule === "one" ? t.product.record : t.product.records;
  return `${n} ${word}`;
}

/** Elige el texto de contenido según el idioma (cae al español si falta). */
export function pick(
  locale: Locale,
  es: string,
  en?: string | null
): string {
  return locale === "en" && en ? en : es;
}
