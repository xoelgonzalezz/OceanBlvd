import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Artist } from "@prisma/client";

import { Reveal } from "@/components/shared/reveal";
import { getDict, recordsLabel } from "@/i18n/server";

type ArtistWithCount = Artist & { _count: { records: number } };

/**
 * Artistas como fichas tipo separador de estantería: cada una con su pestaña
 * (como los divisores que se hojean en una cubeta) en vez de avatares redondos.
 */
export function FeaturedArtists({ artists }: { artists: ArtistWithCount[] }) {
  const t = getDict();
  if (!artists.length) return null;

  return (
    <section className="container py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="section-eyebrow">{t.home.artistsEyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-5xl">
            {t.home.artistsTitle}
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            {t.home.artistsDesc}
          </p>
        </div>
        <Link
          href="/artistas"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {t.home.artistsLink}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-quint group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist, i) => (
          <Reveal key={artist.id} delay={i * 0.04}>
            <Link href={`/artistas/${artist.slug}`} className="group block">
              <article className="relative rounded-[3px] border border-border bg-card p-4 shadow-sleeve transition-[transform,box-shadow] duration-200 ease-out-quint [@media(hover:hover)]:group-hover:-translate-y-1 group-hover:shadow-sleeve-lg">
                {/* Pestaña del separador. */}
                <span
                  aria-hidden
                  className="absolute -top-2 left-5 h-2 w-12 rounded-t-[2px] bg-primary/85"
                />
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-border/80">
                    <Image
                      src={artist.image ?? "/placeholders/artist-01.svg"}
                      alt={artist.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-medium transition-colors group-hover:text-primary">
                      {artist.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                      {recordsLabel(artist._count.records)}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
