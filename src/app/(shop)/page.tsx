import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Hero } from "@/components/home/hero";
import { RecordSection } from "@/components/home/record-section";
import { GenreGrid } from "@/components/home/genre-grid";
import { FeaturedArtists } from "@/components/home/featured-artists";
import { BlogPreview } from "@/components/home/blog-preview";
import { Button } from "@/components/ui/button";
import {
  getBestSellers,
  getFeaturedArtists,
  getFeaturedRecords,
  getGenresWithCount,
  getLatestPosts,
  getNewReleases,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, newReleases, bestSellers, genres, artists, posts] =
    await Promise.all([
      getFeaturedRecords(6),
      getNewReleases(8),
      getBestSellers(8),
      getGenresWithCount(),
      getFeaturedArtists(6),
      getLatestPosts(3),
    ]);

  return (
    <>
      <Hero featured={featured} />

      <RecordSection
        eyebrow="Recién llegados"
        title="Últimas novedades"
        description="Lo último que ha entrado en la tienda, recién desempaquetado."
        href="/tienda?sort=newest"
        linkLabel="Ver novedades"
        records={newReleases}
        priorityCount={4}
      />

      <GenreGrid genres={genres} />

      <RecordSection
        eyebrow="Favoritos"
        title="Más vendidos"
        description="Los discos que más giran entre nuestra clientela."
        href="/tienda?sort=popular"
        linkLabel="Ver más vendidos"
        records={bestSellers}
      />

      <FeaturedArtists artists={artists} />

      <BlogPreview posts={posts} />

      {/* CTA final */}
      <section className="container pb-24 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-foreground px-8 py-14 text-center text-background sm:px-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
          />
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu próxima joya en vinilo te está esperando.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-background/70">
            Más de 40 títulos cuidadosamente seleccionados, entre novedades y
            segunda mano garantizada.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/tienda">
              Entrar en la tienda
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
