import Link from "next/link";
import type { Genre } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre, i) => (
          <Reveal key={genre.id} delay={i * 0.03}>
            <Link
              href={`/tienda?genre=${genre.slug}`}
              className="group flex aspect-[5/4] flex-col justify-between rounded-md border border-border bg-card p-5 transition-colors duration-300 ease-out-quint hover:bg-foreground hover:text-background"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-background/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 -translate-y-1 translate-x-1 opacity-0 transition-all duration-300 ease-out-quint group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium leading-tight">
                  {genre.name}
                </h3>
                <p className="text-xs text-muted-foreground transition-colors group-hover:text-background/60">
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
