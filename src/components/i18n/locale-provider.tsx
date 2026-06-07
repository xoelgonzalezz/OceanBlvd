"use client";

import * as React from "react";

import type { Dictionary, Locale } from "@/i18n/dictionary";

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locale, t: dict }), [locale, dict]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function useLocaleContext() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useT/useLocale deben usarse dentro de LocaleProvider");
  return ctx;
}

export function useT() {
  return useLocaleContext().t;
}

export function useLocale() {
  return useLocaleContext().locale;
}
