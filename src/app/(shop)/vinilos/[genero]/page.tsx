import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disc3 } from "lucide-react";

import { RecordGrid } from "@/components/shared/record-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getAllGenreSlugs, getGenreBySlug, getRecords } from "@/lib/queries";
import { getLocale, pick } from "@/i18n/server";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const genres = await getAllGenreSlugs();
  return genres.map((g) => ({ genero: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { genero: string };
}): Promise<Metadata> {
  const genre = await getGenreBySlug(params.genero);
  if (!genre) return { title: "Género no encontrado" };
  const title = `Vinilos de ${genre.name}`;
  return {
    title,
    description: `Compra vinilos de ${genre.name} en Ocean Blvd Vinyl: novedades, ediciones especiales y discos de segunda mano. Envío en 5 días laborables y gratis desde 60 €.`,
    alternates: { canonical: `/vinilos/${genre.slug}` },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      url: `${SITE.url}/vinilos/${genre.slug}`,
    },
  };
}

/** Texto introductorio único: usa la descripción del género si existe, y siempre
 *  añade un cierre propio para no dejar la landing vacía de contenido. */
function intro(name: string, desc: string | null, locale: "es" | "en"): string {
  if (locale === "en") {
    const lead = `Discover our selection of ${name} vinyl at ${SITE.name}.`;
    const body =
      desc ??
      `We bring together new releases, special editions and second-hand ${name} records, each hand-picked and checked one by one.`;
    return `${lead} ${body} Every record travels in rigid vinyl-specific packaging, with delivery in around 5 working days and free shipping over €60.`;
  }
  const lead = `Descubre nuestra selección de vinilos de ${name} en ${SITE.name}.`;
  const body =
    desc ??
    `Reunimos novedades, ediciones especiales y discos de segunda mano de ${name}, elegidos a mano y revisados uno por uno.`;
  return `${lead} ${body} Cada disco viaja con embalaje rígido específico para vinilo, con entrega en unos 5 días laborables y envío gratis a partir de 60 €.`;
}

export default async function GeneroPage({
  params,
}: {
  params: { genero: string };
}) {
  const genre = await getGenreBySlug(params.genero);
  if (!genre) notFound();

  const loc = getLocale() === "en" ? "en" : "es";
  const name = genre.name;
  const desc = pick(loc, genre.description ?? "", genre.descriptionEn) || null;
  const { records } = await getRecords({
    genres: [genre.slug],
    pageSize: 24,
    sort: "newest",
  });

  const allLabel = loc === "en" ? "See the full catalogue" : "Ver todo el catálogo";
  const emptyTitle =
    loc === "en" ? "No records in this genre yet" : "Aún no hay discos en este género";
  const emptyDesc =
    loc === "en"
      ? "Check back soon: we add new vinyl every week."
      : "Vuelve pronto: añadimos vinilos cada semana.";

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {loc === "en" ? `${name} vinyl` : `Vinilos de ${name}`}
        </h1>
        <p className="mt-4 text-muted-foreground">{intro(name, desc, loc)}</p>
        <div className="mt-4">
          <Link
            href={`/tienda?genre=${genre.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {allLabel}
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
            title={emptyTitle}
            description={emptyDesc}
            actionLabel={allLabel}
            actionHref="/tienda"
          />
        )}
      </div>
    </div>
  );
}
