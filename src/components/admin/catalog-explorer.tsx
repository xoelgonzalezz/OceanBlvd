"use client";

import * as React from "react";
import { Loader2, Search, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Market {
  url: string | null;
  lowestPriceEur: number | null;
  numForSale: number | null;
}
interface Row {
  artist: string;
  title: string;
  year?: number;
  genre?: string;
  reason: string;
  market: Market | null;
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(rows: Row[]) {
  const header = [
    "artista",
    "album",
    "ano",
    "genero",
    "precio_discogs_eur",
    "en_venta",
    "por_que",
    "discogs_url",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.artist),
        csvCell(r.title),
        csvCell(r.year ?? ""),
        csvCell(r.genre ?? ""),
        csvCell(r.market?.lowestPriceEur ?? ""),
        csvCell(r.market?.numForSale ?? ""),
        csvCell(r.reason),
        csvCell(r.market?.url ?? ""),
      ].join(",")
    );
  }
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ideas-catalogo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Atajos para empezar sin escribir (cada clic lanza una búsqueda).
const PRESETS = [
  "Pop / Indie",
  "Rock clásico",
  "Novedades en vinilo",
  "Hip-hop / R&B",
  "Jazz & Soul",
  "Tipo Lana Del Rey",
];

export function CatalogExplorer() {
  const [seed, setSeed] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [discogs, setDiscogs] = React.useState(true);
  const [searched, setSearched] = React.useState(false);

  async function runSearch(query: string) {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/admin/catalog-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo explorar.");
        setRows([]);
        return;
      }
      setRows(data.rows ?? []);
      setDiscogs(Boolean(data.discogs));
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(seed);
  }

  function handlePreset(preset: string) {
    setSeed(preset);
    runSearch(preset);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Un género, artista o estilo… p. ej. «indie pop femenino tipo Lana Del Rey»"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !seed.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Explorando…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Explorar
            </>
          )}
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Prueba:</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePreset(p)}
            disabled={loading}
            className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length} ideas
              {!discogs
                ? " · (sin datos de Discogs: configura DISCOGS_CONSUMER_KEY/SECRET)"
                : ""}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportCsv(rows)}
            >
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Disco</th>
                  <th className="p-3 text-right font-medium">Precio Discogs</th>
                  <th className="p-3 text-right font-medium">En venta</th>
                  <th className="p-3 font-medium">Por qué vende</th>
                  <th className="p-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={`${r.artist}-${r.title}-${i}`} className="align-top">
                    <td className="p-3">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.artist}
                        {r.year ? ` · ${r.year}` : ""}
                        {r.genre ? ` · ${r.genre}` : ""}
                      </p>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {r.market?.lowestPriceEur != null
                        ? `${r.market.lowestPriceEur.toFixed(2)} €`
                        : "—"}
                    </td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">
                      {r.market?.numForSale ?? "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">{r.reason}</td>
                    <td className="p-3">
                      {r.market?.url ? (
                        <a
                          href={r.market.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Discogs <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {searched && !loading && rows.length === 0 && (
        <p className="mt-4 rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          Sin resultados. Prueba con otra búsqueda.
        </p>
      )}
    </div>
  );
}
