import Link from "next/link";
import type { Genre } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { getDict, recordsLabel } from "@/i18n/server";

type GenreWithCount = Genre & { _count: { records: number } };

/**
 * Géneros como índice de catálogo: numerados, con la tipografía display y una
 * inversión cálida al hover. Menos "tarjeta de plantilla", más contraportada.
 */
export function GenreGrid({ genres }: { genres: GenreWithCount[] }) {
  const t = getDict();
  if (!genres.length) return null;
  return (
    <section className="container py-16 md:py-24">
      <div className="mb-10 max-w-xl">
        <span className="section-eyebrow">{t.home.genresEyebrow}</span>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-5xl">
          {t.home.genresTitle}
        </h2>
        <p className="mt-4 text-muted-foreground">{t.home.genresDesc}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre, i) => (
          <Reveal key={genre.id} delay={i * 0.03}>
            <Link
              href={`/tienda?genre=${genre.slug}`}
              className="group flex aspect-[5/4] flex-col justify-between rounded-[4px] border border-border bg-card p-5 transition-[background-color,color,transform] duration-200 ease-out-quint [@media(hover:hover)]:hover:-translate-y-0.5 hover:bg-foreground hover:text-background"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs tracking-wider text-primary transition-colors group-hover:text-background/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 -translate-y-1 translate-x-1 opacity-0 transition-[opacity,transform] duration-200 ease-out-quint group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>
              <div>
                <h3 className="font-display text-xl font-medium leading-tight">
                  {genre.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground transition-colors group-hover:text-background/60">
                  {recordsLabel(genre._count.records)}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
