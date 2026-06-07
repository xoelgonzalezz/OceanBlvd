import Link from "next/link";
import type { Genre } from "@prisma/client";

import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

type GenreWithCount = Genre & { _count: { records: number } };

export function GenreGrid({ genres }: { genres: GenreWithCount[] }) {
  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        eyebrow="Explora"
        title="Navega por género"
        description="Del rock al jazz, del hip-hop a la electrónica. Encuentra tu sonido."
        href="/tienda"
        linkLabel="Ver todo el catálogo"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre, i) => (
          <Reveal key={genre.id} delay={i * 0.04}>
            <Link
              href={`/tienda?genre=${genre.slug}`}
              className="group flex h-full flex-col justify-between rounded-lg border bg-card p-5 transition-all duration-200 ease-out-quint hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
            >
              <span className="text-3xl" aria-hidden>
                {genre.emoji}
              </span>
              <div className="mt-10">
                <h3 className="font-serif text-lg font-medium transition-colors group-hover:text-primary">
                  {genre.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {genre._count.records} discos
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
