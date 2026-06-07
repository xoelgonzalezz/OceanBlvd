import Image from "next/image";
import Link from "next/link";
import type { Artist } from "@prisma/client";

import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { getDict } from "@/i18n/server";

type ArtistWithCount = Artist & { _count: { records: number } };

export function FeaturedArtists({ artists }: { artists: ArtistWithCount[] }) {
  const t = getDict();
  if (!artists.length) return null;

  return (
    <section className="border-y border-border/60 bg-secondary/30 py-16 md:py-20">
      <div className="container">
        <SectionHeading
          eyebrow={t.home.artistsEyebrow}
          title={t.home.artistsTitle}
          description={t.home.artistsDesc}
          href="/artistas"
          linkLabel={t.home.artistsLink}
        />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {artists.map((artist, i) => (
            <Reveal key={artist.id} delay={i * 0.04}>
              <Link
                href={`/artistas/${artist.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-full ring-1 ring-border/60">
                  <Image
                    src={artist.image ?? "/placeholders/artist-01.svg"}
                    alt={artist.name}
                    fill
                    sizes="(max-width: 640px) 40vw, 160px"
                    className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 line-clamp-1 font-serif text-sm font-medium transition-colors group-hover:text-primary sm:text-base">
                  {artist.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {artist._count.records} {t.product.records}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
