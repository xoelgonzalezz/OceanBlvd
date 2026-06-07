import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Reveal } from "@/components/shared/reveal";
import { getArtists } from "@/lib/queries";
import { truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artistas",
  description:
    "Descubre a los artistas de nuestra colección: biografías y todos sus vinilos disponibles en Ocean Blvd Vinyl.",
};

export default async function ArtistasPage() {
  const artists = await getArtists();

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">Voces</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Artistas
        </h1>
        <p className="mt-3 text-muted-foreground">
          De leyendas del rock a pioneros del jazz y la electrónica. Conoce a
          quienes dan forma a nuestra estantería.
        </p>
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
                {artist._count.records} discos
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {truncate(artist.bio, 110)}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
