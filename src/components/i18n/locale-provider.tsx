"use client";

import * as React from "react";

import { getDictionary, type Locale } from "@/i18n/dictionary";

const LocaleContext = React.createContext<Locale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

function useLocaleValue(): Locale {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useT/useLocale deben usarse dentro de LocaleProvider");
  return ctx;
}

/**
 * Diccionario para componentes cliente. Se calcula en el cliente a partir del
 * locale (las funciones del diccionario nunca cruzan el límite servidor→cliente).
 */
export function useT() {
  const locale = useLocaleValue();
  return React.useMemo(() => getDictionary(locale), [locale]);
}

export function useLocale() {
  return useLocaleValue();
}
