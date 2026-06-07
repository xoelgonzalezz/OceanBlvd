import type { Metadata } from "next";

import { RecordGrid } from "@/components/shared/record-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { FiltersSheet } from "@/components/shop/filters-sheet";
import { SortSelect } from "@/components/shop/sort-select";
import { CatalogSearch } from "@/components/shop/catalog-search";
import { Pagination } from "@/components/shop/pagination";
import { getFilterFacets, getRecords } from "@/lib/queries";
import type { SortValue } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Explora todo el catálogo de Ocean Blvd Vinyl: novedades, ediciones especiales y discos de segunda mano por género, artista, década y precio.",
};

function first(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}
function list(v?: string | string[]) {
  const s = first(v);
  return s ? s.split(",").filter(Boolean) : [];
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const genres = list(searchParams.genre);
  const artists = list(searchParams.artist);
  const decades = list(searchParams.decade)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const conditions = list(searchParams.condition);
  const minE = first(searchParams.min);
  const maxE = first(searchParams.max);
  const search = first(searchParams.q);
  const sort = (first(searchParams.sort) as SortValue) || "newest";
  const page = Math.max(1, Number(first(searchParams.page)) || 1);

  const [result, facets] = await Promise.all([
    getRecords({
      genres,
      artists,
      decades,
      conditions,
      minPrice: minE ? Number(minE) * 100 : undefined,
      maxPrice: maxE ? Number(maxE) * 100 : undefined,
      search,
      sort,
      page,
    }),
    getFilterFacets(),
  ]);

  const { records, total, totalPages } = result;

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">Catálogo</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          La tienda
        </h1>
        <p className="mt-3 text-muted-foreground">
          Explora toda nuestra colección, de la novedad recién llegada a la
          joya descatalogada. Filtra, ordena y encuentra tu próximo vinilo.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar facets={facets} />
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FiltersSheet facets={facets} />
              <CatalogSearch />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                {total} {total === 1 ? "disco" : "discos"}
              </span>
              <SortSelect />
            </div>
          </div>

          {records.length ? (
            <div className="mt-8">
              <RecordGrid
                records={records}
                priorityCount={4}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              />
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="No encontramos discos"
                description="Prueba a quitar algún filtro o a buscar otra cosa."
                actionLabel="Limpiar filtros"
                actionHref="/tienda"
              />
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
