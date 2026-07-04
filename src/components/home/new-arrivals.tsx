import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/shared/product-card";
import { getDict, recordsLabel } from "@/i18n/server";
import type { RecordCard } from "@/types";

/**
 * Novedades con aire de "cubeta de tienda": una fila horizontal por la que se
 * pasa como quien hojea discos en una caja, con raíles arriba y abajo y bordes
 * difuminados. Layout propio, distinto de las retículas verticales.
 */
export function NewArrivals({ records }: { records: RecordCard[] }) {
  const t = getDict();
  if (!records.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="section-eyebrow">{t.home.newEyebrow}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-5xl">
              {t.home.newTitle}
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">{t.home.newDesc}</p>
          </div>
          <Link
            href="/tienda?sort=newest"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {t.home.newLink}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-quint group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* La cubeta: raíles + fila deslizante con snap. */}
      <div className="mt-10 border-y border-border/70 bg-secondary/40">
        <div className="mask-fade-x">
          <ul className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-8 sm:gap-7 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]">
            {records.map((record) => (
              <li
                key={record.id}
                className="w-[10.5rem] shrink-0 snap-start sm:w-[12.5rem]"
              >
                <ProductCard
                  record={record}
                  sizes="(max-width: 640px) 42vw, 200px"
                />
              </li>
            ))}
            <li className="flex w-[9rem] shrink-0 snap-start items-center sm:w-[11rem]">
              <Link
                href="/tienda?sort=newest"
                className="group flex aspect-square w-full flex-col items-center justify-center rounded-[3px] border border-dashed border-border text-center transition-colors hover:border-primary hover:text-primary"
              >
                <ArrowRight className="h-6 w-6 transition-transform duration-200 ease-out-quint group-hover:translate-x-1" />
                <span className="mt-2 px-4 text-sm font-medium">
                  {t.home.newLink}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {recordsLabel(records.length)}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
