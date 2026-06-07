import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, MapPin, Calendar, Disc3 } from "lucide-react";

import { RecordGrid } from "@/components/shared/record-grid";
import { getArtistBySlug } from "@/lib/queries";
import { truncate } from "@/lib/utils";
import { getDict, getLocale, pick } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const artist = await getArtistBySlug(params.slug);
  if (!artist) return { title: "Artista no encontrado" };

  return {
    title: artist.name,
    description: truncate(artist.bio, 160),
    openGraph: {
      title: artist.name,
      description: truncate(artist.bio, 160),
      images: [{ url: artist.image ?? "/placeholders/og-default.svg" }],
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: { slug: string };
}) {
  const artist = await getArtistBySlug(params.slug);
  if (!artist) notFound();
  const t = getDict();
  const locale = getLocale();

  return (
    <div className="container py-8 md:py-12">
      <Link
        href="/artistas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {t.artistsPage.allArtists}
      </Link>

      {/* Cabecera */}
      <header className="mt-6 grid gap-8 md:grid-cols-[280px_1fr] md:items-center">
        <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 md:mx-0 md:w-full">
          <Image
            src={artist.image ?? "/placeholders/artist-01.svg"}
            alt={artist.name}
            fill
            priority
            sizes="280px"
            className="object-cover"
          />
        </div>

        <div>
          <span className="section-eyebrow">{t.artistsPage.label}</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {artist.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {artist.country ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {artist.country}
              </span>
            ) : null}
            {artist.foundedYear ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {t.artistsPage.since} {artist.foundedYear}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Disc3 className="h-4 w-4" />
              {artist.records.length} {t.product.records}
            </span>
          </div>
          <p className="prose-editorial mt-5 max-w-2xl">
            {pick(locale, artist.bio, artist.bioEn)}
          </p>
        </div>
      </header>

      {/* Discos del artista */}
      <section className="mt-16">
        <h2 className="mb-8 font-serif text-2xl font-semibold tracking-tight">
          {t.artistsPage.discsBy(artist.name)}
        </h2>
        {artist.records.length ? (
          <RecordGrid
            records={artist.records}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <p className="text-muted-foreground">{t.artistsPage.noDiscs}</p>
        )}
      </section>
    </div>
  );
}
