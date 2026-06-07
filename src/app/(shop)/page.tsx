import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SITE } from "@/lib/constants";
import { getDict } from "@/i18n/server";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/shared/marquee";
import { RecordSection } from "@/components/home/record-section";
import { GenreGrid } from "@/components/home/genre-grid";
import { FeaturedArtists } from "@/components/home/featured-artists";
import { BlogPreview } from "@/components/home/blog-preview";
import { Button } from "@/components/ui/button";
import {
  getBestSellers,
  getFeaturedArtists,
  getGenresWithCount,
  getHeroRecord,
  getLatestPosts,
  getNewReleases,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — Discos de vinilo, novedades y segunda mano` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [heroRecord, newReleases, bestSellers, genres, artists, posts] =
    await Promise.all([
      getHeroRecord(),
      getNewReleases(8),
      getBestSellers(8),
      getGenresWithCount(),
      getFeaturedArtists(6),
      getLatestPosts(3),
    ]);

  const t = getDict();

  return (
    <>
      <Hero record={heroRecord} />

      <Marquee items={[...t.marquee]} />

      <RecordSection
        eyebrow={t.home.newEyebrow}
        title={t.home.newTitle}
        description={t.home.newDesc}
        href="/tienda?sort=newest"
        linkLabel={t.home.newLink}
        records={newReleases}
        priorityCount={4}
      />

      <GenreGrid genres={genres} />

      <RecordSection
        eyebrow={t.home.bestEyebrow}
        title={t.home.bestTitle}
        description={t.home.bestDesc}
        href="/tienda?sort=popular"
        linkLabel={t.home.bestLink}
        records={bestSellers}
      />

      <FeaturedArtists artists={artists} />

      <BlogPreview posts={posts} />

      {/* CTA final */}
      <section className="container pb-24 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-foreground px-6 py-12 text-center text-background sm:px-12 sm:py-16 md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
          />
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-background/70">
            {t.home.ctaDesc}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/tienda">
              {t.home.ctaButton}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
