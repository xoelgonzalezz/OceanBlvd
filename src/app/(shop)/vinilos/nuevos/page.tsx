import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";

import { RecordGrid } from "@/components/shared/record-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getRecords } from "@/lib/queries";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Vinilos nuevos y novedades",
  description:
    "Vinilos nuevos precintados: novedades, reediciones y ediciones especiales. Compra vinilos nuevos online en Ocean Blvd Vinyl con envío en 5 días laborables y gratis desde 60 €.",
  alternates: { canonical: "/vinilos/nuevos" },
};

export const revalidate = 3600;

const COPY = {
  es: {
    h1: "Vinilos nuevos",
    intro:
      "Aquí encontrarás los vinilos nuevos y precintados de Ocean Blvd: novedades recién editadas, reediciones cuidadas y ediciones especiales de color o limitadas. Cada disco llega directo de distribuidor, sin haber pasado por ninguna otra mano, con su precinto original de fábrica. Renovamos la selección constantemente, así que es la sección ideal para estar al día de los últimos lanzamientos en vinilo. Todos los pedidos viajan con embalaje rígido específico para discos y el envío es gratis a partir de 60 €.",
    all: "Ver todo el catálogo",
    emptyTitle: "Aún no hay novedades publicadas",
    emptyDesc: "Vuelve pronto: añadimos vinilos nuevos cada semana.",
  },
  en: {
    h1: "New vinyl",
    intro:
      "Here you'll find Ocean Blvd's new, sealed records: fresh releases, careful reissues and special coloured or limited editions. Every record comes straight from the distributor, untouched, with its original factory seal. We refresh the selection constantly, so this is the ideal section to keep up with the latest vinyl releases. All orders travel in rigid record-specific packaging and shipping is free over €60.",
    all: "See the full catalogue",
    emptyTitle: "No new arrivals yet",
    emptyDesc: "Check back soon: we add new vinyl every week.",
  },
};

export default async function NuevosPage() {
  const locale = getLocale() === "en" ? "en" : "es";
  const c = COPY[locale];
  const { records } = await getRecords({
    conditions: ["NEW"],
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
        <div className="mt-4">
          <Link href="/tienda?condition=NEW" className="text-sm font-medium text-primary hover:underline">
            {c.all}
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
