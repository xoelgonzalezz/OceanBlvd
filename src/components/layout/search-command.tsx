"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  artist: string;
  priceCents: number;
  image: string;
}

/**
 * Buscador de la cabecera. En escritorio es una barra en línea con un
 * desplegable de resultados; en móvil, el icono abre un panel a pantalla
 * completa con la misma búsqueda (input + resultados).
 */
export function SearchCommand() {
  const router = useRouter();
  const t = useT();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false); // desplegable de escritorio
  const [mobileOpen, setMobileOpen] = React.useState(false); // panel móvil
  const ref = React.useRef<HTMLDivElement>(null);

  // Búsqueda con debounce.
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Cerrar el desplegable de escritorio al hacer clic fuera.
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Cerrar el panel móvil con Escape.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  function go(href: string) {
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
    router.push(href);
  }

  function closeMobile() {
    setMobileOpen(false);
    setQuery("");
  }

  // Lista de resultados (compartida entre escritorio y móvil).
  function resultsList() {
    return (
      <>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t.search.searching}
          </div>
        ) : null}

        {!loading && results.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t.search.noResults(query)}
          </div>
        ) : null}

        {results.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => go(`/producto/${r.slug}`)}
            className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
              <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.title}</p>
              <p className="truncate text-xs text-muted-foreground">{r.artist}</p>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatPrice(r.priceCents)}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => go(`/tienda?q=${encodeURIComponent(query)}`)}
          className="mt-1 flex w-full items-center gap-2 rounded-md border-t p-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="h-4 w-4" /> {t.search.seeAll(query)}
        </button>
      </>
    );
  }

  const showDesktopResults = open && query.trim().length > 0;

  return (
    <div ref={ref} className="relative">
      {/* Escritorio: barra de búsqueda en línea */}
      <div className="relative hidden lg:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label={t.header.searchAria}
          placeholder={t.header.search}
          className="h-9 w-64 rounded-full border border-input bg-background/60 pl-9 pr-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:bg-background focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim())
              go(`/tienda?q=${encodeURIComponent(query)}`);
            if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>

      {/* Móvil: icono que abre el panel de búsqueda */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label={t.header.searchAria}
        className="inline-flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:text-foreground lg:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desplegable de resultados de escritorio */}
      {showDesktopResults ? (
        <div className="absolute right-0 z-50 mt-2 hidden w-80 overflow-hidden rounded-lg border bg-card shadow-lg lg:block">
          <div className="max-h-[70vh] overflow-y-auto p-1.5">{resultsList()}</div>
        </div>
      ) : null}

      {/* Panel de búsqueda en móvil (pantalla completa) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={closeMobile}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 top-0 bg-background p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={t.header.searchAria}
                  placeholder={t.header.search}
                  className="h-11 w-full rounded-full border border-input bg-background pl-9 pr-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim())
                      go(`/tienda?q=${encodeURIComponent(query)}`);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={closeMobile}
                aria-label={t.promo.close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {query.trim().length > 0 ? (
              <div className="mt-2 max-h-[65vh] overflow-y-auto rounded-lg border bg-card p-1.5">
                {resultsList()}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
