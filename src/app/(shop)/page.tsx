import type { Metadata } from "next";

import { SITE } from "@/lib/constants";
import { getDict } from "@/i18n/server";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/shared/marquee";
import { RecordSection } from "@/components/home/record-section";
import { FeaturedRecords } from "@/components/home/featured-records";
import { NewArrivals } from "@/components/home/new-arrivals";
import { EditorialMoment } from "@/components/home/editorial-moment";
import { GenreGrid } from "@/components/home/genre-grid";
import { FeaturedArtists } from "@/components/home/featured-artists";
import { BlogPreview } from "@/components/home/blog-preview";
import {
  getBestSellers,
  getFeaturedArtists,
  getFeaturedRecords,
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
  const [heroRecord, featured, newReleases, bestSellers, genres, artists, posts] =
    await Promise.all([
      getHeroRecord(),
      getFeaturedRecords(8),
      getNewReleases(8),
      getBestSellers(8),
      getGenresWithCount(),
      getFeaturedArtists(6),
      getLatestPosts(3),
    ]);

  // Evitamos que un mismo disco aparezca en varias secciones (con catálogo
  // pequeño, "destacados", "novedades" y "más vendidos" mostrarían los mismos
  // discos). Cada sección solo enseña los que aún no han salido más arriba; las
  // que se quedan sin discos no se renderizan (RecordSection devuelve null).
  const shown = new Set<string>();
  if (heroRecord) shown.add(heroRecord.id);

  const take = (records: typeof featured) => {
    const out = records.filter((r) => !shown.has(r.id));
    out.forEach((r) => shown.add(r.id));
    return out;
  };

  const featuredRecords = take(featured);
  const newReleaseRecords = take(newReleases);
  const bestSellerRecords = take(bestSellers);

  const t = getDict();

  return (
    <>
      <Hero record={heroRecord} />

      <Marquee items={[...t.marquee]} />

      <FeaturedRecords records={featuredRecords} />

      <NewArrivals records={newReleaseRecords} />

      <EditorialMoment />

      <GenreGrid genres={genres} />

      <RecordSection
        eyebrow={t.home.bestEyebrow}
        title={t.home.bestTitle}
        description={t.home.bestDesc}
        href="/tienda?sort=popular"
        linkLabel={t.home.bestLink}
        records={bestSellerRecords}
      />

      <FeaturedArtists artists={artists} />

      <BlogPreview posts={posts} />
    </>
  );
}
