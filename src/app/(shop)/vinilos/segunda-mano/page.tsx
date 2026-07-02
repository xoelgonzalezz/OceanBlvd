import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";

import { RecordGrid } from "@/components/shared/record-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getRecords } from "@/lib/queries";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Vinilos de segunda mano",
  description:
    "Vinilos de segunda mano seleccionados y con su estado graduado (M, NM, VG+…). Discos usados en buen estado, con envío en 5 días laborables. Comprar vinilos de segunda mano en Ocean Blvd Vinyl.",
  alternates: { canonical: "/vinilos/segunda-mano" },
};

export const revalidate = 3600;

const COPY = {
  es: {
    h1: "Vinilos de segunda mano",
    intro:
      "Cada vinilo de segunda mano de Ocean Blvd está elegido a mano y revisado uno por uno. Publicamos el estado real de cada copia siguiendo el estándar Goldmine (M, NM, VG+, VG…), para que sepas exactamente qué recibes antes de comprar. Son discos que ya han vivido una historia: reediciones descatalogadas, prensajes originales y rarezas difíciles de encontrar nuevas. Todos viajan con embalaje rígido específico para vinilo y, cuando hace falta, con funda interna antiestática nueva. Si buscas comprar vinilos de segunda mano con garantía y una descripción honesta del estado, esta es tu sección.",
    all: "Ver todo el catálogo",
    grading: "¿Qué significa NM, VG+…? Consulta la escala de estados",
    emptyTitle: "Aún no hay segunda mano publicada",
    emptyDesc: "Vuelve pronto: añadimos discos usados cada semana.",
  },
  en: {
    h1: "Second-hand vinyl",
    intro:
      "Every second-hand record at Ocean Blvd is hand-picked and checked one by one. We publish the real condition of each copy following the Goldmine standard (M, NM, VG+, VG…), so you know exactly what you're getting before you buy. These are records with a history: out-of-print reissues, original pressings and rarities that are hard to find new. They all travel in rigid vinyl-specific packaging and, when needed, a fresh antistatic inner sleeve. If you're looking to buy used vinyl with a guarantee and an honest condition description, this is your section.",
    all: "See the full catalogue",
    grading: "What does NM, VG+… mean? Check the condition scale",
    emptyTitle: "No second-hand records yet",
    emptyDesc: "Check back soon: we add used records every week.",
  },
};

export default async function SegundaManoPage() {
  const locale = getLocale() === "en" ? "en" : "es";
  const c = COPY[locale];
  const { records } = await getRecords({
    conditions: ["USED"],
    pageSize: 24,
    sort: "newest",
  });

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {c.h1}
        </h1>
        <p className="mt-4 text-muted-foreground">{c.intro}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link href="/tienda?condition=USED" className="font-medium text-primary hover:underline">
            {c.all}
          </Link>
          <Link href="/faq" className="text-muted-foreground hover:text-foreground">
            {c.grading}
          </Link>
        </div>
      </header>

      <div className="mt-10">
        {records.length > 0 ? (
          <RecordGrid
            records={records}
            priorityCount={4}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <EmptyState
            icon={Disc3}
            title={c.emptyTitle}
            description={c.emptyDesc}
            actionLabel={c.all}
            actionHref="/tienda"
          />
        )}
      </div>
    </div>
  );
}
