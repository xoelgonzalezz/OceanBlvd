import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Reveal } from "@/components/shared/reveal";
import { getArtists } from "@/lib/queries";
import { truncate } from "@/lib/utils";
import { getDict, getLocale, pick } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artistas",
  description:
    "Descubre a los artistas de nuestra colección: biografías y todos sus vinilos disponibles en Ocean Blvd Vinyl.",
};

export default async function ArtistasPage() {
  const artists = await getArtists();
  const t = getDict();
  const locale = getLocale();

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">{t.artistsPage.eyebrow}</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.artistsPage.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{t.artistsPage.desc}</p>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((artist, i) => (
          <Reveal key={artist.id} delay={Math.min(i, 8) * 0.04}>
            <Link
              href={`/artistas/${artist.slug}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                <Image
                  src={artist.image ?? "/placeholders/artist-01.svg"}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                />
              </div>
              <h2 className="mt-3 font-serif text-lg font-medium transition-colors group-hover:text-primary">
                {artist.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {artist.country ? `${artist.country} · ` : ""}
                {artist._count.records} {t.product.records}
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {truncate(pick(locale, artist.bio, artist.bioEn), 110)}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
