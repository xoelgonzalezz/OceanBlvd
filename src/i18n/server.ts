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

/** Elige el texto de contenido según el idioma (cae al español si falta). */
export function pick(
  locale: Locale,
  es: string,
  en?: string | null
): string {
  return locale === "en" && en ? en : es;
}
