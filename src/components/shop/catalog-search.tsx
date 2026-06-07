"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n/locale-provider";

export function CatalogSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const t = useT();
  const [value, setValue] = React.useState(sp.get("q") ?? "");

  // Sincroniza si el parámetro cambia desde fuera (p. ej. limpiar filtros).
  React.useEffect(() => {
    setValue(sp.get("q") ?? "");
  }, [sp]);

  function apply(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(value);
      }}
      className="relative w-full sm:max-w-xs"
      role="search"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.shop.searchPlaceholder}
        aria-label={t.shop.searchAria}
        className="pl-9 pr-9"
      />
      {value ? (
        <button
          type="button"
          aria-label={t.shop.clearSearch}
          onClick={() => {
            setValue("");
            apply("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </form>
  );
}
