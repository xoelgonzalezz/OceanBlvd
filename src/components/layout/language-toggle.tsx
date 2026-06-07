"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLocale, useT } from "@/components/i18n/locale-provider";

export function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const next = locale === "es" ? "en" : "es";

  function switchTo() {
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchTo}
      aria-label={next === "en" ? t.header.toEn : t.header.toEs}
      className="px-2 text-xs font-semibold tracking-wide text-foreground/80 hover:text-foreground"
    >
      {locale === "es" ? "EN" : "ES"}
    </Button>
  );
}
