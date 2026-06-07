"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Disc3, Search, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  artist: string;
  priceCents: number;
  image: string;
}

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Atajo ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Búsqueda con debounce
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
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
    return () => window.clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar discos y artistas"
        className="inline-flex items-center gap-2 rounded-full text-foreground/80 transition-colors hover:text-foreground lg:h-9 lg:w-64 lg:justify-start lg:border lg:border-input lg:bg-background/60 lg:px-3.5 lg:text-muted-foreground lg:hover:bg-background"
      >
        <Search className="h-5 w-5 lg:h-4 lg:w-4" />
        <span className="hidden text-sm lg:inline">Buscar discos, artistas…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground lg:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Busca un disco o un artista…"
        />
        <CommandList>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Buscando…
            </div>
          ) : null}

          {!loading && query.trim() && results.length === 0 ? (
            <CommandEmpty>No hay resultados para “{query}”.</CommandEmpty>
          ) : null}

          {results.length > 0 ? (
            <CommandGroup heading="Discos">
              {results.map((r) => (
                <CommandItem
                  key={r.id}
                  value={r.id}
                  onSelect={() => go(`/producto/${r.slug}`)}
                  className="gap-3"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={r.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.artist}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatPrice(r.priceCents)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {query.trim() ? (
            <CommandGroup heading="Acciones">
              <CommandItem
                value="ver-todos"
                onSelect={() => go(`/tienda?q=${encodeURIComponent(query)}`)}
              >
                <Search />
                Ver todos los resultados de “{query}”
              </CommandItem>
            </CommandGroup>
          ) : (
            <CommandGroup heading="Accesos rápidos">
              <CommandItem value="tienda" onSelect={() => go("/tienda")}>
                <Disc3 />
                Explorar el catálogo
              </CommandItem>
              <CommandItem value="artistas" onSelect={() => go("/artistas")}>
                <Users />
                Ver artistas
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
