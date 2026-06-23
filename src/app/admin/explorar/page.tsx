import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Compass } from "lucide-react";

import { CatalogExplorer } from "@/components/admin/catalog-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorar catálogo",
  robots: { index: false },
};

export default function ExplorarPage() {
  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mt-4 flex items-start gap-2.5">
        <Compass className="mt-1 h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Explorar catálogo
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            La IA te propone discos que merece la pena tener en stock y Discogs
            aporta el precio real de mercado. Escribe un género, artista o estilo
            y explora; exporta las ideas a CSV para trabajarlas.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CatalogExplorer />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Las sugerencias son orientativas (la IA no conoce ediciones concretas).
        El precio «Discogs» es el más bajo a la venta ahora mismo; úsalo como
        referencia para fijar el tuyo de forma competitiva.
      </p>
    </div>
  );
}
