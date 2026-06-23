import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Download, Upload, Save } from "lucide-react";

import { getAdminRecords } from "@/lib/queries";
import { updateStockAction, importStockCsvAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock",
  robots: { index: false },
};

const MESSAGES: Record<string, string> = {
  "stock-saved": "Stock actualizado.",
  "stock-error": "No se pudo guardar. Revisa los valores (números válidos).",
  "import-done": "Importación completada.",
  "import-empty": "El archivo está vacío o no es un CSV válido.",
  "import-noid": "El CSV debe incluir una columna «id».",
  "import-toobig": "El archivo es demasiado grande (máximo 1 MB).",
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: { msg?: string; n?: string };
}) {
  const records = await getAdminRecords();
  const notice = searchParams.msg ? MESSAGES[searchParams.msg] : null;
  const importedCount =
    searchParams.msg === "import-done" ? searchParams.n : undefined;

  const refs = records.length;
  const units = records.reduce((s, r) => s + r.stock, 0);
  const outOfStock = records.filter((r) => r.stock <= 0).length;

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Stock
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {refs} referencias · {units} unidades
            {outOfStock > 0 ? ` · ${outOfStock} agotadas` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/admin/stock/export">
              <Download className="h-4 w-4" /> Exportar CSV
            </a>
          </Button>
          <form
            action={importStockCsvAction}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="max-w-[180px] text-xs file:mr-2 file:rounded file:border file:border-input file:bg-background file:px-2 file:py-1 file:text-xs"
            />
            <Button type="submit" variant="outline" size="sm">
              <Upload className="h-4 w-4" /> Importar
            </Button>
          </form>
        </div>
      </div>

      {notice && (
        <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {notice}
          {importedCount ? ` ${importedCount} discos actualizados.` : ""}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Edita el stock y el precio de cada disco y pulsa «Guardar». Para cargas
        grandes, exporta el CSV, edítalo en tu hoja de cálculo y vuelve a
        importarlo (se emparejan los discos por su «id»).
      </p>

      {records.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          Todavía no hay discos en el catálogo.
        </p>
      ) : (
        <div className="mt-4 divide-y rounded-lg border">
          {/* Cabecera (solo escritorio) */}
          <div className="hidden grid-cols-[1fr_100px_120px_110px] gap-3 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>Vinilo</span>
            <span>Stock</span>
            <span>Precio (€)</span>
            <span />
          </div>

          {records.map((r) => (
            <form
              key={r.id}
              action={updateStockAction}
              className="grid grid-cols-2 items-center gap-3 px-4 py-3 md:grid-cols-[1fr_100px_120px_110px]"
            >
              <input type="hidden" name="id" value={r.id} />

              <div className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={r.images[0]?.url ?? "/placeholders/cover-01.svg"}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                    {r.artist.name}
                    <Badge
                      variant={r.condition === "NEW" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {CONDITION_LABELS[r.condition] ?? r.condition}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`stock-${r.id}`}
                  className="mb-1 block text-xs text-muted-foreground md:hidden"
                >
                  Stock
                </label>
                <Input
                  id={`stock-${r.id}`}
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={r.stock}
                  className="h-9"
                />
              </div>

              <div>
                <label
                  htmlFor={`price-${r.id}`}
                  className="mb-1 block text-xs text-muted-foreground md:hidden"
                >
                  Precio (€)
                </label>
                <Input
                  id={`price-${r.id}`}
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={(r.priceCents / 100).toFixed(2)}
                  className="h-9"
                />
              </div>

              <Button type="submit" variant="outline" size="sm" className="w-full">
                <Save className="h-4 w-4" /> Guardar
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
